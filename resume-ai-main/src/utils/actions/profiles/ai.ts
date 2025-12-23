"use server";

import { generateObject, generateText } from "ai";
import { z } from "zod";
import { initializeAIClient } from "@/utils/ai-tools";
import { getModelById } from "@/lib/ai-models";
import type {
  Profile,
  WorkExperience,
  Education,
  Project,
  Skill,
} from "@/lib/types";
import type { AIConfig } from "@/lib/ai-models";

// ============================================================================
// UTILITIES & LOGGING
// ============================================================================

function timestamp(): string {
  return (
    new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) +
    "." +
    String(Date.now() % 1000).padStart(3, "0")
  );
}

function log(message: string): void {
  console.log(`[${timestamp()}] ${message}`);
}

function logWarn(message: string): void {
  console.warn(`[${timestamp()}] ${message}`);
}

function isOllamaModel(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.provider === "ollama";
}

// ============================================================================
// JSON EXTRACTION & REPAIR
// ============================================================================

function extractJSON(text: string): string | null {
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/,
    /```\s*([\s\S]*?)\s*```/,
    /(\{[\s\S]*\})\s*$/,
    /^[\s\n]*(\{[\s\S]*\})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const candidate = match[1].trim();
      if (candidate.startsWith("{") || candidate.startsWith("[")) {
        return candidate;
      }
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function repairJSON(text: string): string {
  let result = text;
  result = result.replace(/,(\s*[}\]])/g, "$1");
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return result;
}

function safeJSONParse(text: string): unknown | null {
  const jsonStr = extractJSON(text);
  if (!jsonStr) return null;

  try {
    return JSON.parse(jsonStr);
  } catch {
    try {
      return JSON.parse(repairJSON(jsonStr));
    } catch {
      log("[AI] JSON parse failed even after repair");
      return null;
    }
  }
}

// ============================================================================
// PERMISSIVE SCHEMAS
// ============================================================================

const basicInfoSchema = z
  .object({
    first_name: z.string().optional().default(""),
    last_name: z.string().optional().default(""),
    email: z.string().optional().default(""),
    phone_number: z.string().optional().default(""),
    phone: z.string().optional(),
    location: z.string().optional().default(""),
    city: z.string().optional(),
    website: z.string().optional().default(""),
    website_url: z.string().optional(),
    portfolio: z.string().optional(),
    linkedin_url: z.string().optional().default(""),
    linkedin: z.string().optional(),
    github_url: z.string().optional().default(""),
    github: z.string().optional(),
  })
  .passthrough();

const workExperienceItemSchema = z
  .object({
    company: z.string().optional().default(""),
    employer: z.string().optional(),
    organization: z.string().optional(),
    position: z.string().optional().default(""),
    title: z.string().optional(),
    role: z.string().optional(),
    job_title: z.string().optional(),
    location: z.string().optional().default(""),
    start_date: z.string().optional().default(""),
    end_date: z.string().optional().default(""),
    date: z.string().optional(),
    description: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .default([]),
    responsibilities: z.union([z.array(z.string()), z.string()]).optional(),
    bullets: z.union([z.array(z.string()), z.string()]).optional(),
    achievements: z.union([z.array(z.string()), z.string()]).optional(),
    technologies: z.array(z.string()).optional().default([]),
    tech_stack: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
  })
  .passthrough();

const workExperienceSchema = z
  .object({
    work_experience: z.array(workExperienceItemSchema).optional().default([]),
    experience: z.array(workExperienceItemSchema).optional(),
    jobs: z.array(workExperienceItemSchema).optional(),
    employment: z.array(workExperienceItemSchema).optional(),
  })
  .passthrough();

const educationItemSchema = z
  .object({
    school: z.string().optional().default(""),
    institution: z.string().optional(),
    university: z.string().optional(),
    college: z.string().optional(),
    degree: z.string().optional().default(""),
    field: z.string().optional().default(""),
    major: z.string().optional(),
    concentration: z.string().optional(),
    location: z.string().optional().default(""),
    start_date: z.string().optional().default(""),
    end_date: z.string().optional().default(""),
    date: z.string().optional(),
    graduation_date: z.string().optional(),
    graduation_year: z.string().optional(),
    expected_graduation: z.string().optional(),
    gpa: z.union([z.string(), z.number()]).optional(),
    achievements: z.array(z.string()).optional().default([]),
    honors: z.array(z.string()).optional(),
    awards: z.array(z.string()).optional(),
    activities: z.array(z.string()).optional(),
  })
  .passthrough();

const educationSchema = z
  .object({
    education: z.array(educationItemSchema).optional().default([]),
  })
  .passthrough();

const projectItemSchema = z
  .object({
    name: z.string().optional().default(""),
    title: z.string().optional(),
    project_name: z.string().optional(),
    description: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .default([]),
    summary: z.string().optional(),
    details: z.union([z.array(z.string()), z.string()]).optional(),
    technologies: z.array(z.string()).optional().default([]),
    tech_stack: z.array(z.string()).optional(),
    stack: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    url: z.string().optional().default(""),
    link: z.string().optional(),
    live_url: z.string().optional(),
    demo_url: z.string().optional(),
    github_url: z.string().optional().default(""),
    repo: z.string().optional(),
    repository: z.string().optional(),
    github: z.string().optional(),
    start_date: z.string().optional().default(""),
    end_date: z.string().optional().default(""),
    date: z.string().optional(),
  })
  .passthrough();

const projectsSchema = z
  .object({
    projects: z.array(projectItemSchema).optional().default([]),
  })
  .passthrough();

const skillCategorySchema = z
  .object({
    category: z.string().optional().default(""),
    name: z.string().optional(),
    items: z.array(z.string()).optional().default([]),
    skills: z.array(z.string()).optional(),
  })
  .passthrough();

const skillsSchema = z
  .object({
    skills: z
      .union([
        z.array(skillCategorySchema),
        z.record(z.array(z.string())),
        z.array(z.string()),
      ])
      .optional()
      .default([]),
  })
  .passthrough();

const fullProfileSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone_number: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    website_url: z.string().optional(),
    linkedin_url: z.string().optional(),
    github_url: z.string().optional(),
    work_experience: z.array(workExperienceItemSchema).optional(),
    education: z.array(educationItemSchema).optional(),
    projects: z.array(projectItemSchema).optional(),
    skills: z
      .union([z.array(skillCategorySchema), z.record(z.array(z.string()))])
      .optional(),
  })
  .passthrough();

// ============================================================================
// PROMPTS
// ============================================================================

const BASIC_INFO_PROMPT = `Extract contact information from this resume. Return a JSON object.

## Fields to Extract:
- first_name: First name only
- last_name: Last name only  
- email: Email address
- phone_number: Phone number with country code if present
- location: City, State or City, Country format
- website: Personal website/portfolio URL
- linkedin_url: LinkedIn profile URL
- github_url: GitHub profile URL

## URL Formatting Rules:
1. LinkedIn: Convert any format to full URL
   - "linkedin.com/in/johndoe" → "https://linkedin.com/in/johndoe"
   - "LinkedIn: johndoe" → "https://linkedin.com/in/johndoe"
   - "/in/johndoe" → "https://linkedin.com/in/johndoe"

2. GitHub: Convert any format to full URL
   - "github.com/johndoe" → "https://github.com/johndoe"
   - "GitHub: johndoe" → "https://github.com/johndoe"

3. Website: Ensure starts with https://
   - "johndoe.com" → "https://johndoe.com"

4. Skip vague text like "click here", "visit site", "see portfolio"

## Example Output:
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+1-555-123-4567",
  "location": "San Francisco, CA",
  "website": "https://johndoe.dev",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "github_url": "https://github.com/johndoe"
}

Use empty string "" for any field not found.`;

const WORK_EXPERIENCE_PROMPT = `Extract all work/employment experience from this resume. Return a JSON object.

## Fields to Extract for Each Job:
- company: Company or organization name
- position: Job title (e.g., "Software Engineer", "Frontend Developer", "Data Analyst")
- location: City, State or City, Country
- start_date: Start date in "Mon YYYY" format (e.g., "Jan 2020", "Mar 2022")
- end_date: End date in "Mon YYYY" format, or "Present" if current role
- description: Array of bullet points (responsibilities and achievements)
- technologies: Array of ALL technologies, tools, frameworks, and libraries mentioned

## CRITICAL - Technology Extraction Rules:
Extract EVERY technology mentioned in or related to the job, including:
- Programming languages: Python, JavaScript, TypeScript, Java, C++, Go, Rust, PHP, Ruby, etc.
- Frontend: React, Vue, Angular, Next.js, Svelte, HTML, CSS, Sass, TailwindCSS, Bootstrap, jQuery, etc.
- Backend: Node.js, Express, Django, Flask, FastAPI, Spring Boot, .NET, Laravel, Rails, etc.
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Firebase, Supabase, DynamoDB, etc.
- Cloud/DevOps: AWS, GCP, Azure, Docker, Kubernetes, Terraform, Jenkins, GitHub Actions, CI/CD, etc.
- Tools: Git, VS Code, Figma, Postman, Jira, Slack, Notion, etc.
- APIs/Services: REST, GraphQL, WebSocket, Stripe, Twilio, SendGrid, OAuth, JWT, etc.
- Mobile: React Native, Flutter, Swift, Kotlin, Android, iOS, etc.
- AI/ML: TensorFlow, PyTorch, OpenAI, LangChain, Hugging Face, scikit-learn, etc.
- Testing: Jest, Mocha, Pytest, Cypress, Selenium, etc.

DO NOT include in technologies:
- CSS concepts like "flexbox", "grid", "responsive design", "animations"
- Generic terms like "web development", "software development"
- Soft skills or methodologies

## Example Output:
{
  "work_experience": [
    {
      "company": "TechCorp",
      "position": "Senior Frontend Developer",
      "location": "Bangalore, India",
      "start_date": "Jun 2021",
      "end_date": "Present",
      "description": [
        "Led development of customer-facing dashboard using React and TypeScript",
        "Implemented real-time notifications with WebSocket and Redis pub/sub",
        "Reduced bundle size by 40% through code splitting and lazy loading"
      ],
      "technologies": ["React", "TypeScript", "Next.js", "TailwindCSS", "Redis", "WebSocket", "AWS", "Jest", "GitHub Actions"]
    }
  ]
}

Return {"work_experience": []} if no work experience section exists.`;

const EDUCATION_PROMPT = `Extract all education entries from this resume. Return a JSON object.

## Fields to Extract for Each Entry:
- school: Full name of university/college/institution
- degree: Degree type (Bachelor of Science, Master of Arts, B.Tech, M.Tech, Ph.D., etc.)
- field: Major or field of study (Computer Science, Business Administration, etc.)
- location: City, State or City, Country of the institution
- start_date: Start year as 4 digits (e.g., "2018")
- end_date: End/graduation year as 4 digits (e.g., "2022")
- expected_graduation: If "Expected" is mentioned, extract the expected year here
- gpa: GPA if mentioned (e.g., "3.8/4.0" or "8.5/10")
- achievements: Array of honors, awards, scholarships, relevant coursework, activities

## Date Handling Rules:
1. If only "Expected YYYY" or "Expected graduation YYYY" is mentioned:
   - Set end_date to "currently studying" or "Present"
   - Calculate start_date as (expected year - typical duration) based on degree:
      - Bachelor's: 4 years if BTech/Bachelor of Technology, else 3 years
      - Master's: 2 years
   
2. If date range like "2018-2022" or "2018 - 2022":
   - start_date = "2018", end_date = "2022"

3. If only graduation year like "Class of 2022" or "Graduated 2022":
   - Set end_date to "2022"
   - Estimate start_date based on typical duration:
      - Bachelor's: end year - 4 years if BTech/Bachelor of Technology, else -3 years
      - Master's: end year - 2 years

## Achievements - Include:
- Relevant Coursework: List of relevant courses (keep as single string like "Relevant Coursework: ML, AI, Data Structures")
- Honors: Dean's List, Cum Laude, Magna Cum Laude, Summa Cum Laude
- Awards: Scholarships, academic awards, competition wins, hackathon prizes
- Leadership: Club president, organization roles, student body position
- Activities: Research projects, publications, notable projects

## Achievements - DO NOT Include:
- "Expected graduation in..." statements
- "Major in..." statements (this goes in field)
- General descriptions of the program

## Example Output:
{
  "education": [
    {
      "school": "Indian Institute of Technology Delhi",
      "degree": "Bachelor of Technology",
      "field": "Computer Science and Engineering",
      "location": "New Delhi, India",
      "start_date": "2020",
      "end_date": "2024",
      "gpa": "8.5/10",
      "achievements": ["Dean's List (4 semesters)", "Smart India Hackathon Winner", "Relevant Coursework: Machine Learning, Data Structures, Algorithms"]
    }
  ]
}

Return {"education": []} if no education section exists.`;

const PROJECTS_PROMPT = `Extract all dated projects from this resume. Return a JSON object.

## Where to Look:
- Sections labeled: Projects, Personal Projects, Side Projects, Portfolio, Open Source, Academic Projects

## Fields to Extract for Each Project:
- name: Project name/title
- description: Array of bullet points explaining the project and your contributions
- technologies: Array of ALL technologies, frameworks, libraries, and tools used
- url: Live demo or deployed URL if mentioned
- github_url: GitHub repository URL if mentioned
- start_date: Start date in "Mon YYYY" format if mentioned (either one or both)
- end_date: End date in "Mon YYYY" format if mentioned (if ongoing, use "Present")

## CRITICAL - Date Rules:
- If single date mentioned (e.g., "Jan 2024"), use it for both start_date and end_date
- If range mentioned (e.g., "Jan 2024 - Mar 2024"), extract both

## CRITICAL - Technology Extraction:
Extract EVERY technology mentioned according to your knowledge, including:
- Languages: Python, JavaScript, TypeScript, Java, C++, Go, etc.
- Frontend: React, Vue, Angular, Next.js, HTML, CSS, TailwindCSS, Bootstrap, Chakra UI, Material-UI, etc.
- Backend: Node.js, Express, Django, Flask, FastAPI, Spring Boot, NestJS, etc.
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Firebase, Supabase, etc.
- APIs: REST API, GraphQL, WebSocket, tRPC, etc.
- Cloud: AWS, GCP, Azure, Vercel, Netlify, Heroku, Railway, Render, etc.
- DevOps: Docker, Kubernetes, GitHub Actions, CI/CD, etc.
- Auth: Clerk, Auth0, NextAuth, Firebase Auth, JWT, OAuth, etc.
- Payments: Stripe, Razorpay, PayPal, etc.
- AI: OpenAI API, LangChain, Hugging Face, TensorFlow, PyTorch, etc.
- Other: Puppeteer, Cheerio, Socket.io, Prisma, Drizzle, Zod, etc.

DO NOT include generic terms like "responsive design", "flexbox", "grid", "RESTful", "SEO" , "best practises" and other non-technology concepts.

## Example Output:
{
  "projects": [
    {
      "name": "AI Resume Builder",
      "description": [
        "Built a full-stack resume builder with AI-powered content generation",
        "Implemented PDF generation and real-time preview",
        "Integrated OpenAI API for intelligent suggestions"
      ],
      "technologies": ["Next.js", "TypeScript", "TailwindCSS", "Prisma", "PostgreSQL", "OpenAI API", "Clerk", "Vercel", "React-PDF"],
      "url": "https://myresumebuilder.com",
      "github_url": "https://github.com/user/resume-builder",
      "start_date": "Jan 2024",
      "end_date": "Mar 2024"
    }
  ]
}

Return {"projects": []} if no projects section exists.`;

const SKILLS_PROMPT = `Extract and categorize ALL skills from this resume. Return a JSON object.

## IMPORTANT: Extract ALL skill categories as they appear in the resume, including:

### Technical Skills:
- Languages: Programming languages (Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, etc.)
- Frameworks: Frameworks and libraries (React, Next.js, Vue, Angular, Django, FastAPI, Spring Boot, etc.)
- Databases: Database systems (PostgreSQL, MySQL, MongoDB, Redis, Firebase, etc.)
- Tools: Development tools (Git, Docker, Kubernetes, VS Code, Postman, Figma, etc.)
- Cloud: Cloud platforms (AWS, GCP, Azure, Vercel, Netlify, etc.)

### Non-Technical Skills (if present in resume):
- Soft Skills: Communication, Leadership, Team Collaboration, Problem Solving, Quick Learning, etc.
- Other Competencies: UI/UX, Technical Writing, Proposal Writing, Documentation, etc.
- Methodologies: Agile, Scrum, Kanban, etc. (if listed as skills)

## Rules:
1. Preserve the EXACT category names from the resume when possible
2. If resume says "Soft Skills:", create a "Soft Skills" category
3. If resume says "Other Competencies:", create an "Other Competencies" category
4. Include ALL items listed under each category
5. Use consistent capitalization (React not react, PostgreSQL not postgres)

## Example Output (with soft skills):
{
  "skills": [
    {"category": "Languages", "items": ["Python", "TypeScript", "JavaScript", "SQL", "Go"]},
    {"category": "Frameworks", "items": ["React", "Next.js", "FastAPI", "Django", "TailwindCSS"]},
    {"category": "Databases", "items": ["PostgreSQL", "MongoDB", "Redis"]},
    {"category": "Tools", "items": ["Docker", "Git", "Linux", "Kubernetes", "Figma"]},
    {"category": "Cloud", "items": ["AWS", "GCP", "Vercel"]},
    {"category": "Other Competencies", "items": ["Responsive Web Design", "UI/UX Basics", "Technical Writing"]},
    {"category": "Soft Skills", "items": ["Communication", "Team Collaboration", "Quick Learning", "Problem Solving"]}
  ]
}

Return {"skills": []} if no skills section exists.`;

const FULL_EXTRACTION_PROMPT = `Extract all structured information from this resume. Return a single JSON object.

## Structure:
{
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "phone_number": "...",
  "location": "City, State",
  "website": "https://...",
  "linkedin_url": "https://linkedin.com/in/...",
  "github_url": "https://github.com/...",
  
  "work_experience": [
    {
      "company": "...",
      "position": "Job Title",
      "location": "City, State",
      "start_date": "Mon YYYY",
      "end_date": "Mon YYYY or Present",
      "description": ["bullet 1", "bullet 2"],
      "technologies": ["ALL", "technologies", "mentioned"]
    }
  ],
  
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "location": "City, State",
      "start_date": "YYYY",
      "end_date": "YYYY",
      "expected_graduation": "YYYY if expected",
      "gpa": "3.8/4.0",
      "achievements": ["Honor 1", "Award 2", "Relevant Coursework: ...", "Activities..."]
    }
  ],
  
  "projects": [
    {
      "name": "Project Name",
      "description": ["What it does", "Key features"],
      "start_date": "Mon YYYY",
      "end_date": "Mon YYYY or Present",
      "technologies": ["ALL", "tech", "used"],
      "url": "https://...",
      "github_url": "https://github.com/..."
    }
  ],
  
  "skills": [
    {"category": "Languages", "items": ["Python", "JavaScript"]},
    {"category": "Frameworks", "items": ["React", "Django"]},
    {"category": "Soft Skills", "items": ["Communication", "Leadership"]}
  ]
}

## Common Rules:
- Use "" for missing string fields
- Use [] for missing array fields
- Extract ALL technologies from projects and experience
- Include soft skills and other competencies if present
- LinkedIn/GitHub URLs must be full URLs with https://

## CRITICAL - Common Date Rules(Except for Education):
- If single date mentioned (e.g., "Jan 2024"), use it for both start_date and end_date
- If range mentioned (e.g., "Jan 2024 - Mar 2024"), extract both

## CRITICAL - Education Date Handling Rules:
1. If only "Expected YYYY" or "Expected graduation YYYY" is mentioned:
   - Set end_date to "currently studying" or "Present"
   - Calculate start_date as (expected year - typical duration) based on degree as per your knowledge or common standards like:
      - Bachelor's: 4 years if BTech/Bachelor of Technology, else 3 years
      - Master's: 2 years
   
2. If date range like "2018-2022" or "2018 - 2022":
   - start_date = "2018", end_date = "2022"

3. If only graduation year like "Class of 2022" or "Graduated 2022":
   - Set end_date to "2022"
   - Estimate start_date based on typical duration:
      - Bachelor's: end year - 4 years if BTech/Bachelor of Technology, else -3 years
      - Master's: end year - 2 years

## URL Formatting Rules:
1. LinkedIn: Convert any format to full URL
   - "linkedin.com/in/johndoe" → "https://linkedin.com/in/johndoe"
   - "LinkedIn: johndoe" → "https://linkedin.com/in/johndoe"
   - "/in/johndoe" → "https://linkedin.com/in/johndoe"

2. GitHub: Convert any format to full URL
   - "github.com/johndoe" → "https://github.com/johndoe"
   - "GitHub: johndoe" → "https://github.com/johndoe"

3. Website: Ensure starts with https://
   - "johndoe.com" → "https://johndoe.com"

4. Skip vague text like "click here", "visit site", "see portfolio"

## Achievements - Include:
- Relevant Coursework: List of relevant courses (keep as single string like "Relevant Coursework: ML, AI, Data Structures")
- Honors: Dean's List, Cum Laude, Magna Cum Laude, Summa Cum Laude
- Awards: Scholarships, academic awards, competition wins, hackathon prizes
- Leadership: Club president, organization roles, student body position
- Activities: Research projects, publications, notable projects

## Achievements - DO NOT Include:
- "Expected graduation in..." statements
- "Major in..." statements (this goes in field)
- General descriptions of the program

## CRITICAL - Skill/Tool/Technology Extraction:
1. Extract EVERY technology mentioned according to your knowledge.
2. DO NOT include generic terms or soft skills/methodologies like "responsive design", "flexbox", "grid", "RESTful", "SEO" , "best practises" and other non-technology concepts.

## Skill-Categories Extraction Rules:
1. Preserve the EXACT category names from the resume when possible
2. Include ALL items listed under each category
3. Use consistent capitalization (React not react, PostgreSQL not postgres)
4. Include all technical and non-technical skills if present


`;

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

function normalizeURL(
  value: string | undefined | null,
  type: "linkedin" | "github" | "website"
): string {
  if (!value || typeof value !== "string") return "";

  let normalized = value.trim();
  if (!normalized) return "";

  normalized = normalized
    .replace(/^(linkedin|github|website|portfolio|site|link|url)[\s:]+/i, "")
    .trim();

  if (/^(click|visit|see|view|check|here|my\s)/i.test(normalized)) return "";

  if (type === "linkedin") {
    const patterns = [
      /linkedin\.com\/in\/([\w-]+)/i,
      /\/in\/([\w-]+)/i,
      /linkedin[:\s]+@?([\w-]+)/i,
    ];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        return `https://linkedin.com/in/${match[1]}`;
      }
    }
    if (normalized.includes("linkedin.com")) {
      return normalized.startsWith("http")
        ? normalized
        : `https://${normalized}`;
    }
  }

  if (type === "github") {
    const patterns = [/github\.com\/([\w-]+)/i, /github[:\s]+@?([\w-]+)/i];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1] && match[1].toLowerCase() !== "github") {
        return `https://github.com/${match[1]}`;
      }
    }
    if (normalized.includes("github.com")) {
      return normalized.startsWith("http")
        ? normalized
        : `https://${normalized}`;
    }
  }

  if (type === "website") {
    if (!normalized.startsWith("http") && /^[\w-]+\.[\w.-]+/.test(normalized)) {
      return `https://${normalized}`;
    }
    if (normalized.startsWith("http")) {
      return normalized;
    }
  }

  return "";
}

function normalizeMonthYear(date: string | undefined | null): string {
  if (!date || typeof date !== "string") return "";

  const trimmed = date.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (["present", "current", "now", "ongoing"].includes(lower)) {
    return "Present";
  }

  if (/^[A-Z][a-z]{2}\s+\d{4}$/i.test(trimmed)) {
    return (
      trimmed.charAt(0).toUpperCase() +
      trimmed.slice(1, 3).toLowerCase() +
      trimmed.slice(3)
    );
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNamesLower = monthNames.map((m) => m.toLowerCase());

  const monthYearMatch = trimmed.match(/([A-Za-z]+)\.?\s*(\d{4})/);
  if (monthYearMatch) {
    const monthStr = monthYearMatch[1].toLowerCase().slice(0, 3);
    const monthIndex = monthNamesLower.indexOf(monthStr);
    if (monthIndex !== -1) {
      return `${monthNames[monthIndex]} ${monthYearMatch[2]}`;
    }
  }

  const numericMatch = trimmed.match(
    /(\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})/
  );
  if (numericMatch) {
    const month = numericMatch[1] || numericMatch[4];
    const year = numericMatch[2] || numericMatch[3];
    const monthNum = parseInt(month, 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return `${monthNames[monthNum - 1]} ${year}`;
    }
  }

  const yearMatch = trimmed.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : "";
}

function normalizeYear(date: string | undefined | null): string {
  if (!date || typeof date !== "string") return "";

  const trimmed = date.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (["present", "current", "now", "ongoing"].some((s) => lower.includes(s))) {
    return "Present";
  }

  const yearMatch = trimmed.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : "";
}

// Infer education start date based on degree duration
function inferEducationStartYear(degree: string, endYear: number): number {
  const degreeLower = degree.toLowerCase();

  // 4-year programs
  if (
    degreeLower.includes("b.tech") ||
    degreeLower.includes("btech") ||
    degreeLower.includes("bachelor") ||
    degreeLower.includes("b.e.") ||
    degreeLower.includes("b.s.") ||
    degreeLower.includes("b.a.") ||
    degreeLower.includes("b.sc") ||
    degreeLower.includes("b.com") ||
    degreeLower.includes("be ") ||
    degreeLower.includes("bs ") ||
    degreeLower.includes("ba ")
  ) {
    return endYear - 4;
  }

  // 2-year programs
  if (
    degreeLower.includes("m.tech") ||
    degreeLower.includes("mtech") ||
    degreeLower.includes("master") ||
    degreeLower.includes("m.s.") ||
    degreeLower.includes("m.a.") ||
    degreeLower.includes("m.sc") ||
    degreeLower.includes("mba") ||
    degreeLower.includes("mca") ||
    degreeLower.includes("associate") ||
    degreeLower.includes("diploma")
  ) {
    return endYear - 2;
  }

  // 3-year programs (some bachelor's)
  if (
    degreeLower.includes("bca") ||
    degreeLower.includes("bba") ||
    degreeLower.includes("llb")
  ) {
    return endYear - 3;
  }

  // PhD - typically 4-5 years
  if (
    degreeLower.includes("ph.d") ||
    degreeLower.includes("phd") ||
    degreeLower.includes("doctor")
  ) {
    return endYear - 4;
  }

  // Default to 4 years
  return endYear - 4;
}

function formatDateRange(
  startDate: string,
  endDate: string,
  yearOnly = false
): string {
  const normalizer = yearOnly ? normalizeYear : normalizeMonthYear;
  const start = normalizer(startDate);
  const end = normalizer(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return end;
  }
  return "";
}

function normalizeDescription(desc: unknown): string[] {
  if (!desc) return [];

  if (Array.isArray(desc)) {
    return desc
      .filter((d) => typeof d === "string" && d.trim())
      .map((d) => (d as string).trim());
  }

  if (typeof desc === "string" && desc.trim()) {
    const bullets = desc.split(/(?:^|\n)\s*[-•*]\s*/);
    const cleaned = bullets.filter((b) => b.trim()).map((b) => b.trim());
    return cleaned.length > 0 ? cleaned : [desc.trim()];
  }

  return [];
}

// Only filter out truly non-tech terms from project/work technologies
// Keep a minimal blocklist
const NON_TECH_TERMS_STRICT = new Set([
  "flexbox",
  "flex",
  "grid",
  "css grid",
  "responsive design",
  "responsive",
  "mobile-first",
  "mobile first",
  "cross-browser",
  "media queries",
  "web development",
  "software development",
  "full stack",
  "full-stack",
  "frontend",
  "backend",
]);

function normalizeTechnologies(tech: unknown): string[] {
  if (!tech) return [];

  const items: string[] = [];

  if (Array.isArray(tech)) {
    items.push(...tech.filter((t) => typeof t === "string"));
  } else if (typeof tech === "string") {
    items.push(...tech.split(/,\s*/));
  }

  return items
    .map((t) => t.trim())
    .filter((t) => t && !NON_TECH_TERMS_STRICT.has(t.toLowerCase()));
}

// For skills, don't filter - keep everything including soft skills
function normalizeSkillItems(items: unknown): string[] {
  if (!items) return [];

  const result: string[] = [];

  if (Array.isArray(items)) {
    result.push(
      ...items
        .filter((t) => typeof t === "string")
        .map((t) => (t as string).trim())
    );
  } else if (typeof items === "string") {
    result.push(...items.split(/,\s*/).map((t) => t.trim()));
  }

  return result.filter((t) => t.length > 0);
}

function normalizeSkills(skills: unknown): Skill[] {
  if (!skills) return [];

  // Already correct format: [{category, items}]
  if (Array.isArray(skills) && skills.length > 0) {
    const first = skills[0];
    if (
      typeof first === "object" &&
      first !== null &&
      ("category" in first || "name" in first)
    ) {
      return skills
        .map((s: Record<string, unknown>) => ({
          category: String(s.category || s.name || "Other"),
          items: normalizeSkillItems(s.items || s.skills),
        }))
        .filter((s) => s.items.length > 0);
    }

    // Flat array of strings
    if (typeof first === "string") {
      const items = normalizeSkillItems(skills);
      return items.length > 0 ? [{ category: "Technical Skills", items }] : [];
    }
  }

  // Object format: {"Languages": ["Python", "JS"]}
  if (typeof skills === "object" && !Array.isArray(skills) && skills !== null) {
    const result: Skill[] = [];
    for (const [category, items] of Object.entries(
      skills as Record<string, unknown>
    )) {
      const normalized = normalizeSkillItems(items);
      if (normalized.length > 0) {
        result.push({ category, items: normalized });
      }
    }
    return result;
  }

  return [];
}

function filterAchievements(achievements: unknown): string[] {
  if (!Array.isArray(achievements)) return [];

  return (achievements as string[]).filter((a) => {
    if (typeof a !== "string") return false;
    const lower = a.toLowerCase();
    if (lower.includes("expected graduation")) return false;
    if (lower.includes("anticipated graduation")) return false;
    if (/^major\s+in\s/i.test(lower)) return false;
    if (/^minor\s+in\s/i.test(lower)) return false;
    if (/^concentration\s+in\s/i.test(lower)) return false;
    return a.trim().length > 0;
  });
}

function normalizeWorkExperience(workExp: unknown): WorkExperience[] {
  if (!Array.isArray(workExp)) return [];

  return workExp
    .map((exp) => {
      const e = exp as Record<string, unknown>;

      const position = String(
        e.position || e.title || e.role || e.job_title || e.jobTitle || ""
      ).trim();

      const company = String(
        e.company || e.employer || e.organization || e.org || ""
      ).trim();

      const description = normalizeDescription(
        e.description ||
          e.responsibilities ||
          e.bullets ||
          e.achievements ||
          e.duties
      );

      const technologies = normalizeTechnologies(
        e.technologies ||
          e.tech_stack ||
          e.techStack ||
          e.tools ||
          e.skills ||
          e.tech
      );

      let date = "";
      if (e.date && typeof e.date === "string") {
        date = e.date;
      } else {
        const startDate = e.start_date || e.startDate || "";
        const endDate = e.end_date || e.endDate || "";
        date = formatDateRange(String(startDate), String(endDate), false);
      }

      return {
        company,
        position,
        location: String(e.location || "").trim() || undefined,
        date,
        description,
        technologies: technologies.length > 0 ? technologies : undefined,
      };
    })
    .filter((e) => e.company || e.position);
}

function normalizeEducation(education: unknown): Education[] {
  if (!Array.isArray(education)) return [];

  return education
    .map((edu) => {
      const e = edu as Record<string, unknown>;

      const school = String(
        e.school || e.institution || e.university || e.college || ""
      ).trim();

      const degree = String(e.degree || "").trim();

      // Handle dates with NLP inference
      let startYear = "";
      let endYear = "";

      // Check for expected graduation
      const expectedGrad = e.expected_graduation || e.expectedGraduation;
      if (expectedGrad) {
        const expYear = normalizeYear(String(expectedGrad));
        if (expYear && expYear !== "Present") {
          endYear = expYear;
          // Infer start year based on degree
          const endYearNum = parseInt(expYear, 10);
          if (!isNaN(endYearNum) && degree) {
            startYear = String(inferEducationStartYear(degree, endYearNum));
          }
        }
      }

      // If no expected graduation, use regular date fields
      if (!endYear) {
        if (e.date && typeof e.date === "string") {
          // Check if it's a range
          const rangeMatch = (e.date as string).match(
            /(\d{4})\s*[-–—]\s*(\d{4}|[Pp]resent)/
          );
          if (rangeMatch) {
            startYear = rangeMatch[1];
            endYear =
              rangeMatch[2].toLowerCase() === "present"
                ? "Present"
                : rangeMatch[2];
          } else {
            endYear = normalizeYear(e.date);
          }
        } else {
          startYear = normalizeYear(String(e.start_date || e.startDate || ''));
          endYear = normalizeYear(
            String(e.end_date || e.endDate || e.graduation_date || e.graduation_year || '')
          );
        }
      }

      // If only end year and degree, infer start
      if (endYear && endYear !== "Present" && !startYear && degree) {
        const endYearNum = parseInt(endYear, 10);
        if (!isNaN(endYearNum)) {
          startYear = String(inferEducationStartYear(degree, endYearNum));
        }
      }

      const date =
        startYear && endYear
          ? `${startYear} - ${endYear}`
          : endYear || startYear;

      const rawAchievements =
        e.achievements || e.honors || e.awards || e.activities || [];
      const achievements = filterAchievements(rawAchievements);

      let gpa: string | number | undefined;
      if (e.gpa !== undefined && e.gpa !== null && e.gpa !== "") {
        gpa = typeof e.gpa === "number" ? e.gpa : String(e.gpa).trim();
      }

      return {
        school,
        degree,
        field: String(e.field || e.major || e.concentration || "").trim(),
        location: String(e.location || "").trim() || undefined,
        date,
        gpa,
        achievements: achievements.length > 0 ? achievements : undefined,
      };
    })
    .filter((e) => e.school);
}

function normalizeProjects(projects: unknown): Project[] {
  if (!Array.isArray(projects)) return [];

  return projects
    .map((proj) => {
      const p = proj as Record<string, unknown>;

      const name = String(
        p.name || p.title || p.project_name || p.projectName || ""
      ).trim();

      const description = normalizeDescription(
        p.description || p.summary || p.details
      );

      const technologies = normalizeTechnologies(
        p.technologies ||
          p.tech_stack ||
          p.techStack ||
          p.stack ||
          p.tools ||
          p.tech
      );

      let date: string | undefined;
      if (p.date && typeof p.date === "string") {
        date = p.date;
      } else {
        const startDate = p.start_date || p.startDate || "";
        const endDate = p.end_date || p.endDate || "";
        if (startDate || endDate) {
          const combined = formatDateRange(
            String(startDate),
            String(endDate),
            false
          );
          date = combined || undefined;
        }
      }

      const url = normalizeURL(
        String(p.url || p.link || p.live_url || p.liveUrl || p.demo_url || p.demoUrl || ''),
        "website"
      );

      const github_url = normalizeURL(
        String(p.github_url || p.githubUrl || p.repo || p.repository || p.github || ''),
        "github"
      );

      return {
        name,
        description,
        date,
        technologies: technologies.length > 0 ? technologies : undefined,
        url: url || undefined,
        github_url: github_url || undefined,
      };
    })
    .filter((p) => p.name);
}

interface NormalizedBasicInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
}

function normalizeBasicInfo(
  data: Record<string, unknown>
): NormalizedBasicInfo {
  return {
    first_name: String(data.first_name || data.firstName || "").trim(),
    last_name: String(data.last_name || data.lastName || "").trim(),
    email: String(data.email || "").trim(),
    phone_number: String(
      data.phone_number || data.phone || data.phoneNumber || ""
    ).trim(),
    location: String(data.location || data.city || data.address || "").trim(),
    website: normalizeURL(
      String(data.website || data.website_url || data.portfolio || data.site || ''),
      "website"
    ),
    linkedin_url: normalizeURL(
      String(data.linkedin_url || data.linkedin || data.linkedIn || ''),
      "linkedin"
    ),
    github_url: normalizeURL(
      String(data.github_url || data.github || data.gitHub || ''),
      "github"
    ),
  };
}

interface NormalizedResult {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  work_experience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  skills?: Skill[];
}

function normalizeAIResponse(data: Record<string, unknown>): NormalizedResult {
  const basicInfo = normalizeBasicInfo(data);

  const result: NormalizedResult = { ...basicInfo };

  const workExp =
    data.work_experience ||
    data.experience ||
    data.jobs ||
    data.employment ||
    data.workExperience;
  if (workExp) {
    const normalized = normalizeWorkExperience(workExp);
    if (normalized.length > 0) {
      result.work_experience = normalized;
    }
  }

  if (data.education) {
    const normalized = normalizeEducation(data.education);
    if (normalized.length > 0) {
      result.education = normalized;
    }
  }

  if (data.projects) {
    const normalized = normalizeProjects(data.projects);
    if (normalized.length > 0) {
      result.projects = normalized;
    }
  }

  if (data.skills) {
    const normalized = normalizeSkills(data.skills);
    if (normalized.length > 0) {
      result.skills = normalized;
    }
  }

  return result;
}

// ============================================================================
// EXTRACTION WITH FALLBACK
// ============================================================================

type AIModel = Parameters<typeof generateObject>[0]["model"];

interface ExtractionResult<T> {
  success: boolean;
  data: T | null;
  method?: "generateObject" | "generateText";
  error?: string;
}

async function extractWithFallback<T>(
  resumeText: string,
  model: AIModel,
  schema: z.ZodSchema<T>,
  prompt: string,
  sectionName: string
): Promise<ExtractionResult<T>> {
  const startTime = Date.now();
  log(`[AI] Extracting ${sectionName}...`);

  // Attempt 1: generateObject
  try {
    const result = await generateObject({
      model,
      schema,
      prompt: `${prompt}\n\n---\nRESUME TEXT:\n---\n${resumeText}`,
      temperature: 0.1,
    });
    const elapsed = Date.now() - startTime;
    log(`[AI] ${sectionName} complete via generateObject (${elapsed}ms)`);
    return { success: true, data: result.object, method: "generateObject" };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logWarn(
      `[AI] ${sectionName} generateObject failed: ${errMsg.slice(0, 100)}`
    );
  }

  // Attempt 2: generateText with JSON parsing
  try {
    log(`[AI] ${sectionName} trying text fallback...`);
    const result = await generateText({
      model,
      prompt: `${prompt}\n\nReturn ONLY valid JSON, no other text or markdown.\n\n---\nRESUME TEXT:\n---\n${resumeText}`,
      temperature: 0.1,
    });

    const parsed = safeJSONParse(result.text);
    if (parsed && typeof parsed === "object") {
      try {
        const validated = schema.parse(parsed);
        const elapsed = Date.now() - startTime;
        log(
          `[AI] ${sectionName} complete via text fallback + validation (${elapsed}ms)`
        );
        return { success: true, data: validated, method: "generateText" };
      } catch {
        const elapsed = Date.now() - startTime;
        log(`[AI] ${sectionName} using raw parsed data (${elapsed}ms)`);
        return { success: true, data: parsed as T, method: "generateText" };
      }
    }

    logWarn(`[AI] ${sectionName} text fallback failed: could not parse JSON`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logWarn(
      `[AI] ${sectionName} text fallback failed: ${errMsg.slice(0, 100)}`
    );
  }

  const elapsed = Date.now() - startTime;
  logWarn(`[AI] ${sectionName} FAILED after ${elapsed}ms`);
  return { success: false, data: null, error: "All extraction methods failed" };
}

// ============================================================================
// SEQUENTIAL EXTRACTION FOR OLLAMA
// ============================================================================

async function sequentialOllamaExtraction(
  resumeText: string,
  model: AIModel
): Promise<Record<string, unknown>> {
  log("[AI] Starting sequential extraction (Ollama mode)...");
  const totalStartTime = Date.now();

  const merged: Record<string, unknown> = {};
  const failures: string[] = [];

  // 1. Basic Info
  const basicResult = await extractWithFallback(
    resumeText,
    model,
    basicInfoSchema,
    BASIC_INFO_PROMPT,
    "basicInfo"
  );
  if (basicResult.success && basicResult.data) {
    Object.assign(merged, basicResult.data);
    log("[AI] ✓ basicInfo merged");
  } else {
    failures.push("basicInfo");
  }

  // 2. Work Experience
  const workResult = await extractWithFallback(
    resumeText,
    model,
    workExperienceSchema,
    WORK_EXPERIENCE_PROMPT,
    "workExperience"
  );
  if (workResult.success && workResult.data) {
    const data = workResult.data as Record<string, unknown>;
    merged.work_experience =
      data.work_experience || data.experience || data.jobs || [];
    log("[AI] ✓ workExperience merged");
  } else {
    failures.push("workExperience");
  }

  // 3. Education
  const eduResult = await extractWithFallback(
    resumeText,
    model,
    educationSchema,
    EDUCATION_PROMPT,
    "education"
  );
  if (eduResult.success && eduResult.data) {
    const data = eduResult.data as Record<string, unknown>;
    merged.education = data.education || [];
    log("[AI] ✓ education merged");
  } else {
    failures.push("education");
  }

  // 4. Projects
  const projResult = await extractWithFallback(
    resumeText,
    model,
    projectsSchema,
    PROJECTS_PROMPT,
    "projects"
  );
  if (projResult.success && projResult.data) {
    const data = projResult.data as Record<string, unknown>;
    merged.projects = data.projects || [];
    log("[AI] ✓ projects merged");
  } else {
    failures.push("projects");
  }

  // 5. Skills
  const skillsResult = await extractWithFallback(
    resumeText,
    model,
    skillsSchema,
    SKILLS_PROMPT,
    "skills"
  );
  if (skillsResult.success && skillsResult.data) {
    const data = skillsResult.data as Record<string, unknown>;
    merged.skills = data.skills || [];
    log("[AI] ✓ skills merged");
  } else {
    failures.push("skills");
  }

  const totalElapsed = Date.now() - totalStartTime;
  if (failures.length > 0) {
    logWarn(`[AI] Failed sections: ${failures.join(", ")}`);
  }
  log(
    `[AI] Sequential extraction complete (${totalElapsed}ms total, ${failures.length} failures)`
  );

  return merged;
}

// ============================================================================
// SINGLE-PASS FOR CLOUD MODELS
// ============================================================================

async function cloudSinglePassExtraction(
  resumeText: string,
  model: AIModel
): Promise<Record<string, unknown>> {
  log("[AI] Starting single-pass extraction (cloud mode)...");
  const startTime = Date.now();

  const result = await extractWithFallback(
    resumeText,
    model,
    fullProfileSchema,
    FULL_EXTRACTION_PROMPT,
    "fullProfile"
  );

  const elapsed = Date.now() - startTime;

  if (result.success && result.data) {
    log(`[AI] Single-pass extraction complete (${elapsed}ms)`);
    return result.data as Record<string, unknown>;
  }

  throw new Error("Cloud extraction failed");
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export async function formatProfileWithAI(
  resumeText: string,
  config: AIConfig
): Promise<Partial<Profile>> {
  const modelId = config.model;
  const model = initializeAIClient(config);
  const useOllama = isOllamaModel(modelId);

  log(`[AI] ========================================`);
  log(`[AI] Starting profile extraction`);
  log(`[AI] Model: ${modelId}`);
  log(
    `[AI] Mode: ${
      useOllama ? "Sequential multi-pass (Ollama)" : "Single-pass (Cloud)"
    }`
  );
  log(`[AI] Resume length: ${resumeText.length} chars`);
  log(`[AI] ========================================`);

  let rawResult: Record<string, unknown>;

  try {
    if (useOllama) {
      rawResult = await sequentialOllamaExtraction(resumeText, model);
    } else {
      rawResult = await cloudSinglePassExtraction(resumeText, model);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logWarn(`[AI] Extraction failed: ${errMsg}`);
    throw new Error(`Resume extraction failed: ${errMsg}`);
  }

  log("[AI] Normalizing response...");
  const normalized = normalizeAIResponse(rawResult);

  const result: Partial<Profile> = {};

  if (normalized.first_name) result.first_name = normalized.first_name;
  if (normalized.last_name) result.last_name = normalized.last_name;
  if (normalized.email) result.email = normalized.email;
  if (normalized.phone_number) result.phone_number = normalized.phone_number;
  if (normalized.location) result.location = normalized.location;
  if (normalized.website) result.website = normalized.website;
  if (normalized.linkedin_url) result.linkedin_url = normalized.linkedin_url;
  if (normalized.github_url) result.github_url = normalized.github_url;

  if (normalized.work_experience && normalized.work_experience.length > 0) {
    result.work_experience = normalized.work_experience;
  }
  if (normalized.education && normalized.education.length > 0) {
    result.education = normalized.education;
  }
  if (normalized.projects && normalized.projects.length > 0) {
    result.projects = normalized.projects;
  }
  if (normalized.skills && normalized.skills.length > 0) {
    result.skills = normalized.skills;
  }

  log(`[AI] ========================================`);
  log(`[AI] Extraction complete`);
  log(`[AI] Results: ${Object.keys(result).length} fields populated`);
  if (result.work_experience)
    log(`[AI]   - ${result.work_experience.length} work experiences`);
  if (result.education)
    log(`[AI]   - ${result.education.length} education entries`);
  if (result.projects) log(`[AI]   - ${result.projects.length} projects`);
  if (result.skills) log(`[AI]   - ${result.skills.length} skill categories`);
  log(`[AI] ========================================`);

  return result;
}
