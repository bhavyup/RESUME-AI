import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ApiKey,
  getModelById,
  getModelProvider,
  isValidModelId,
  getDefaultModel,
} from "@/lib/ai-models";
import { formatProfileWithAI } from "@/utils/actions/profiles/ai";

// Configuration
const SHARED_TOKEN = process.env.LINKEDIN_INGEST_TOKEN;
const MAX_PAYLOAD_SIZE = 50000; // 50KB max raw text

// Rate limiting (simple in-memory, replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Schemas
const experienceSchema = z.object({
  position: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  description: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  school: z.string().optional(),
  degree: z.string().optional(),
  field: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  name: z.string().optional(),
  description: z.array(z.string()).optional(),
  date: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
  github_url: z.string().optional(),
});

const skillCategorySchema = z.object({
  category: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const payloadSchema = z.object({
  source: z.literal("linkedin-extension"),
  url: z.string().optional(),
  scraped_at: z.string().optional(),
  headline: z.string().optional(),
  about: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  work_experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillCategorySchema).optional(),
  raw_text: z.string().max(MAX_PAYLOAD_SIZE).optional(),
});

type LinkedInPayload = z.infer<typeof payloadSchema>;

function buildPromptContent(parsed: LinkedInPayload): string {
  const parts: string[] = [];

  // Header info
  if (parsed.first_name || parsed.last_name) {
    parts.push(
      `Name: ${parsed.first_name || ""} ${parsed.last_name || ""}`.trim()
    );
  }
  if (parsed.headline) parts.push(`Headline: ${parsed.headline}`);
  if (parsed.location) parts.push(`Location: ${parsed.location}`);
  if (parsed.email) parts.push(`Email: ${parsed.email}`);
  if (parsed.url) parts.push(`LinkedIn URL: ${parsed.url}`);
  if (parsed.website) parts.push(`Website: ${parsed.website}`);
  if (parsed.github_url) parts.push(`GitHub: ${parsed.github_url}`);
  if (parsed.about) parts.push(`\nAbout:\n${parsed.about}`);

  // Work Experience
  if (parsed.work_experience?.length) {
    parts.push("\n--- WORK EXPERIENCE ---");
    for (const exp of parsed.work_experience) {
      const lines = [
        `Position: ${exp.position || "Unknown"}`,
        `Company: ${exp.company || "Unknown"}`,
      ];
      if (exp.location) lines.push(`Location: ${exp.location}`);
      if (exp.date) lines.push(`Dates: ${exp.date}`);
      if (exp.description?.length) {
        lines.push("Responsibilities:");
        exp.description.forEach((d) => lines.push(`  • ${d}`));
      }
      if (exp.technologies?.length) {
        lines.push(`Technologies: ${exp.technologies.join(", ")}`);
      }
      parts.push(lines.join("\n"));
    }
  }

  // Education
  if (parsed.education?.length) {
    parts.push("\n--- EDUCATION ---");
    for (const edu of parsed.education) {
      const lines = [`School: ${edu.school || "Unknown"}`];
      if (edu.degree) lines.push(`Degree: ${edu.degree}`);
      if (edu.field) lines.push(`Field: ${edu.field}`);
      if (edu.date) lines.push(`Dates: ${edu.date}`);
      if (edu.location) lines.push(`Location: ${edu.location}`);
      if (edu.achievements?.length) {
        lines.push("Achievements:");
        edu.achievements.forEach((a) => lines.push(`  • ${a}`));
      }
      parts.push(lines.join("\n"));
    }
  }

  // Projects
  if (parsed.projects?.length) {
    parts.push("\n--- PROJECTS ---");
    for (const proj of parsed.projects) {
      const lines = [`Project: ${proj.name || "Unknown"}`];
      if (proj.date) lines.push(`Dates: ${proj.date}`);
      if (proj.description?.length) {
        proj.description.forEach((d) => lines.push(`  ${d}`));
      }
      if (proj.technologies?.length) {
        lines.push(`Technologies: ${proj.technologies.join(", ")}`);
      }
      if (proj.url) lines.push(`URL: ${proj.url}`);
      if (proj.github_url) lines.push(`GitHub: ${proj.github_url}`);
      parts.push(lines.join("\n"));
    }
  }

  // Skills
  if (parsed.skills?.length) {
    parts.push("\n--- SKILLS ---");
    for (const skill of parsed.skills) {
      if (skill.category && skill.items?.length) {
        parts.push(`${skill.category}: ${skill.items.join(", ")}`);
      } else if (skill.items?.length) {
        parts.push(`Skills: ${skill.items.join(", ")}`);
      }
    }
  }

  let content = parts.filter(Boolean).join("\n\n");

  // If structured content is thin, append raw text
  if (content.length < 500 && parsed.raw_text) {
    content += `\n\n--- RAW PROFILE TEXT ---\n${parsed.raw_text.slice(
      0,
      10000
    )}`;
  }

  return content;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    // Auth check
    if (SHARED_TOKEN) {
      const headerToken = req.headers.get("x-linkedin-token");
      if (!headerToken || headerToken !== SHARED_TOKEN) {
        console.log("[LinkedIn Ingest] Unauthorized request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const parsed = payloadSchema.parse(body);

    console.log("[LinkedIn Ingest] Received payload:", {
      name:
        `${parsed.first_name || ""} ${parsed.last_name || ""}`.trim() ||
        "Unknown",
      experiences: parsed.work_experience?.length || 0,
      education: parsed.education?.length || 0,
      skills: parsed.skills?.[0]?.items?.length || 0,
      rawTextLength: parsed.raw_text?.length || 0,
    });

    // Build content for AI processing
    const content = buildPromptContent(parsed);

    if (!content.trim()) {
      return NextResponse.json(
        {
          error:
            "No content to process. Please ensure the LinkedIn profile loaded correctly.",
        },
        { status: 400 }
      );
    }

    // Get model configuration

    const clientPreferredModel = req.headers.get("x-preferred-model");
    const envDefaultModel = process.env.LINKEDIN_INGEST_MODEL;
    let selectedModelId = getDefaultModel(false);

    if (clientPreferredModel && isValidModelId(clientPreferredModel)) {
      selectedModelId = clientPreferredModel;
      console.log(
        `[LinkedIn Ingest] Using Client Preference: ${selectedModelId}`
      );
    } else if (envDefaultModel && isValidModelId(envDefaultModel)) {
      selectedModelId = envDefaultModel;
      console.log(`[LinkedIn Ingest] Using Env Default: ${selectedModelId}`);
    } else {
      console.log(`[LinkedIn Ingest] Using System Default: ${selectedModelId}`);
    }

    const modelInfo = getModelById(selectedModelId);
    const provider = modelInfo ? getModelProvider(selectedModelId) : undefined;

    if (!modelInfo || !provider) {
      console.error(`[LinkedIn Ingest] Unknown model: ${selectedModelId}`);
      return NextResponse.json(
        { error: `Server configuration error: Unknown model` },
        { status: 500 }
      );
    }

    // Build API keys
    const apiKeys: ApiKey[] = [];

    if (provider.id !== "ollama") {
      const envKey = process.env[provider.envKey];
      const headerKey = req.headers.get(`x-${provider.id}-key`);

      if (headerKey) {
        apiKeys.push({
          service: provider.id,
          key: headerKey,
          addedAt: new Date().toISOString(),
        });
      } else if (envKey) {
        apiKeys.push({
          service: provider.id,
          key: envKey,
          addedAt: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { error: `${provider.name} API key not configured on server` },
          { status: 500 }
        );
      }
    }

    console.log(`[LinkedIn Ingest] Processing with model: ${selectedModelId}`);

    // Process with AI
    const result = await formatProfileWithAI(content, {
      model: selectedModelId,
      apiKeys,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[LinkedIn Ingest] Complete in ${elapsed}ms:`, {
      experiences: result.work_experience?.length || 0,
      education: result.education?.length || 0,
      projects: result.projects?.length || 0,
      skills: result.skills?.length || 0,
    });

    return NextResponse.json({
      status: "ok",
      result,
      processingTimeMs: elapsed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[LinkedIn Ingest] Validation error:", error.flatten());
      return NextResponse.json(
        { error: "Invalid payload format", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("[LinkedIn Ingest] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
}
