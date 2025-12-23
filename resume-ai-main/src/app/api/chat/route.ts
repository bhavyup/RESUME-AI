import { LanguageModelV1, ToolInvocation, smoothStream, streamText } from "ai";
import { Resume, Job } from "@/lib/types";
import { initializeAIClient, type AIConfig } from "@/utils/ai-tools";
import { tools } from "@/lib/tools";
import { getSubscriptionPlan } from "@/utils/actions/stripe/actions";
import { checkRateLimit } from "@/lib/rateLimiter";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ChatRequest {
  messages: Message[];
  resume: Resume;
  target_role: string;
  config?: AIConfig;
  job?: Job;
}

export async function POST(req: Request) {
  try {
    const requestBody = await req.json(); // Console log the entire request to see what's being sent
    console.log("=== FULL CHAT REQUEST ===");
    console.log("Request body keys:", Object.keys(requestBody));
    console.log("Messages count:", requestBody.messages?.length || 0);
    console.log("Target role:", requestBody.target_role);
    console.log("Config:", JSON.stringify(requestBody.config, null, 2));
    console.log("Job:", requestBody.job ? "Job object present" : "No job");
    console.log("Resume present:", !!requestBody.resume);
    if (requestBody.resume) {
      console.log("Resume keys:", Object.keys(requestBody.resume));
      console.log("Resume first_name:", requestBody.resume.first_name);
      console.log("Resume last_name:", requestBody.resume.last_name);
      console.log("Resume target_role:", requestBody.resume.target_role);
      console.log(
        "Work experience count:",
        requestBody.resume.work_experience?.length || 0
      );
      console.log(
        "Education count:",
        requestBody.resume.education?.length || 0
      );
      console.log("Skills count:", requestBody.resume.skills?.length || 0);
      console.log("Projects count:", requestBody.resume.projects?.length || 0);
    }
    console.log("Full request body:", JSON.stringify(requestBody, null, 2));
    console.log("=== END CHAT REQUEST ===");

    const { messages, target_role, config, job, resume }: ChatRequest =
      requestBody; // Get subscription plan and user ID

    const { plan, id } = await getSubscriptionPlan(true);
    const isPro = plan === "pro"; // Apply rate limiting only for Pro users

    if (isPro) {
      try {
        await checkRateLimit(id);
      } catch (error) {
        // Add type checking for error
        const message =
          error instanceof Error ? error.message : "Rate limit exceeded";
        const match = message.match(/(\d+) seconds/);
        const retryAfter = match ? parseInt(match[1], 10) : 60;
        return new Response(
          JSON.stringify({
            error: message, // Use validated message
            expirationTimestamp: Date.now() + retryAfter * 1000,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
            },
          }
        );
      }
    } // Initialize the AI client using the provided config and plan.

    const aiClient = initializeAIClient(config, isPro);

    console.log("THE AI Client is:", aiClient); // Build the resume context for the system prompt

    const resumeContext = resume
      ? `
CURRENT RESUME DATA (you already have access to this - NO NEED to call getResume tool):
- Name: ${resume.first_name} ${resume.last_name}
- Email: ${resume.email}
- Phone: ${resume.phone_number}
- Location: ${resume.location}
- Target Role: ${resume.target_role}
- LinkedIn: ${resume.linkedin_url || "Not provided"}
- GitHub: ${resume.github_url || "Not provided"}
- Website: ${resume.website || "Not provided"}

WORK EXPERIENCE (${resume.work_experience?.length || 0} entries):
${
  resume.work_experience
    ?.map(
      (exp, i) => ` [${i}] ${exp.position} at ${exp.company} (${exp.date})
   ${exp.description?.map((d) => `   - ${d}`).join("\n") || ""}`
    )
    .join("\n") || "None"
}

EDUCATION (${resume.education?.length || 0} entries):
${
  resume.education
    ?.map(
      (edu, i) =>
        ` [${i}] ${edu.degree} in ${edu.field} from ${edu.school} (${edu.date})`
    )
    .join("\n") || "None"
}

SKILLS (${resume.skills?.length || 0} categories):
${
  resume.skills
    ?.map((skill, i) => ` [${i}] ${skill.category}: ${skill.items?.join(", ")}`)
    .join("\n") || "None"
}

PROJECTS (${resume.projects?.length || 0} entries):
${
  resume.projects
    ?.map(
      (proj, i) => ` [${i}] ${proj.name} (${proj.date})
 ${proj.description?.map((d) => `- ${d}`).join("\n") || ""}`
    )
    .join("\n") || "None"
}
`
      : "No resume data available."; // Build and send the AI call.

    const result = streamText({
      model: aiClient as LanguageModelV1,
      system: `
You are ResumeAI, an expert resume improvement assistant. You MUST use tools to make changes - never ask for permission or clarification.

${resumeContext}

${
  job
    ? `TARGET JOB:\n${JSON.stringify(job, null, 2)}`
    : "No specific job provided."
}

=== CRITICAL INSTRUCTIONS ===
When the user asks to IMPROVE, UPDATE, or MODIFY any section:
1. DO NOT ask for the index - you already have all the data above with [index] numbers
2. DO NOT ask for clarification - just improve ALL entries in that section
3. IMMEDIATELY call the appropriate tool for EACH entry
4. Call multiple tools in sequence to improve all entries

=== TOOL USAGE EXAMPLES ===

If user says "Improve my work experience":
→ Call suggest_work_experience_improvement for index 0
→ Call suggest_work_experience_improvement for index 1
→ (repeat for all work experiences)

If user says "Improve my projects":
→ Call suggest_project_improvement for index 0, 1, 2, etc.

=== AVAILABLE TOOLS ===

1. suggest_work_experience_improvement
 Call with: { "index": 0, "improved_experience": { "date": "...", "company": "...", "location": "...", "position": "...", "description": ["bullet 1", "bullet 2"], "technologies": ["tech1", "tech2"] } }

2. suggest_project_improvement
 Call with: { "index": 0, "improved_project": { "name": "...", "description": ["bullet 1", "bullet 2"], "date": "...", "technologies": ["tech1"] } }

3. suggest_skill_improvement
 Call with: { "index": 0, "improved_skill": { "category": "...", "items": ["skill1", "skill2"] } }

4. suggest_education_improvement
 Call with: { "index": 0, "improved_education": { "school": "...", "degree": "...", "field": "...", "date": "...", "achievements": ["achievement1"] } }

=== IMPROVEMENT GUIDELINES ===
- Use strong action verbs (Engineered, Architected, Spearheaded, Optimized)
- Add quantifiable metrics (increased by 40%, reduced latency by 60%)
- Format important keywords in **bold**
- Keep bullet points concise but impactful
- Align content with the target role: ${
        resume?.target_role || "Software Engineer"
      }

DO NOT ASK QUESTIONS. JUST CALL THE TOOLS IMMEDIATELY.
   `,
      messages,
      maxSteps: 10,
      tools,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
    });

    return result.toDataStreamResponse({
      sendUsage: false,
      getErrorMessage: (error) => {
        if (!error) return "Unknown error occurred";
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
