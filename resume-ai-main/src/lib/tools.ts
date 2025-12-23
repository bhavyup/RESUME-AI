import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getResumeTool = createTool({
  description: 'Get the user Resume. Can request specific sections or "all" for the entire resume.',
  parameters: z.object({
    sections: z.union([
      z.string(),
      z.array(z.enum([
        'all',
        'personal_info',
        'work_experience',
        'education',
        'skills',
        'projects',
      ]))
    ]).transform(val => Array.isArray(val) ? val : [val]),
  }),
});

export const suggestWorkExperienceTool = createTool({
  description: `Suggest improvements for a work experience entry. REQUIRED parameters:
- index: number (0, 1, 2, etc.) - which work experience to improve
- improved_experience: object with date, company, position, description array, and optional location/technologies

Example: {"index": 0, "improved_experience": {"date": "Jan 2023 - Present", "company": "Acme Corp", "position": "Senior Engineer", "description": ["Led team of 5", "Increased revenue 40%"]}}`,
  parameters: z.object({
    index: z.coerce.number().describe('Index of the work experience entry (0, 1, 2, etc.)'),
    improved_experience: z.object({
      date: z.string().describe('Date range like "Jan 2023 - Present"'),
      company: z.string().describe('Company name'),
      location: z.string().optional().describe('Location like "New York, NY"'),
      position: z.string().describe('Job title'),
      description: z.array(z.string()).describe('Array of bullet points'),
      technologies: z.array(z.string()).optional().describe('Technologies used'),
    }).describe('The improved work experience object'),
  }),
});

export const suggestProjectTool = createTool({
  description: `Suggest improvements for a project entry. REQUIRED parameters:
- index: number (0, 1, 2, etc.) - which project to improve
- improved_project: object with name, description array

Example: {"index": 0, "improved_project": {"name": "AI Chat App", "description": ["Built real-time chat with AI", "Deployed to 1000+ users"]}}`,
  parameters: z.object({
    index: z.coerce.number().describe('Index of the project entry (0, 1, 2, etc.)'),
    improved_project: z.object({
      name: z.string().describe('Project name'),
      description: z.array(z.string()).describe('Array of bullet points'),
      date: z.string().optional().describe('Date or date range'),
      technologies: z.array(z.string()).optional().describe('Technologies used'),
      url: z.string().optional().describe('Live URL'),
      github_url: z.string().optional().describe('GitHub URL'),
    }).describe('The improved project object'),
  }),
});

export const suggestSkillTool = createTool({
  description: `Suggest improvements for a skill category. REQUIRED parameters:
- index: number (0, 1, 2, etc.) - which skill category to improve
- improved_skill: object with category and items array

Example: {"index": 0, "improved_skill": {"category": "Programming Languages", "items": ["Python", "TypeScript", "Go"]}}`,
  parameters: z.object({
    index: z.coerce.number().describe('Index of the skill category (0, 1, 2, etc.)'),
    improved_skill: z.object({
      category: z.string().describe('Category name like "Programming Languages"'),
      items: z.array(z.string()).describe('Array of skills'),
    }).describe('The improved skill category'),
  }),
});

export const suggestEducationTool = createTool({
  description: `Suggest improvements for an education entry. REQUIRED parameters:
- index: number (0, 1, 2, etc.) - which education entry to improve
- improved_education: object with school, degree, field, date

Example: {"index": 0, "improved_education": {"school": "MIT", "degree": "Bachelor of Science", "field": "Computer Science", "date": "2019 - 2023"}}`,
  parameters: z.object({
    index: z.coerce.number().describe('Index of the education entry (0, 1, 2, etc.)'),
    improved_education: z.object({
      school: z.string().describe('School/University name'),
      degree: z.string().describe('Degree type like "Bachelor of Science"'),
      field: z.string().describe('Field of study'),
      location: z.string().optional().describe('Location'),
      date: z.string().describe('Date or date range'),
      gpa: z.string().optional().describe('GPA if applicable'),
      achievements: z.array(z.string()).optional().describe('Achievements/honors'),
    }).describe('The improved education object'),
  }),
});

export const modifyWholeResumeTool = createTool({
  description: 'Modify multiple sections of the resume at once. For important keywords, format them as bold, like this: **keyword**. Put two asterisks around the keyword or phrase.',
  parameters: z.object({
    basic_info: z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().optional(),
      phone_number: z.string().optional(),
      location: z.string().optional(),
      website: z.string().optional(),
      linkedin_url: z.string().optional(),
      github_url: z.string().optional(),
    }).optional(),
    work_experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      date: z.string(),
      description: z.array(z.string()),
      technologies: z.array(z.string()).optional(),
    })).optional(),
    education: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      location: z.string().optional(),
      date: z.string(),
      gpa: z.string().optional(),
      achievements: z.array(z.string()).optional(),
    })).optional(),
    skills: z.array(z.object({
      category: z.string(),
      items: z.array(z.string()),
    })).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.array(z.string()),
      date: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      url: z.string().optional(),
      github_url: z.string().optional(),
    })).optional(),
  }),
});



  

// Export all tools in a single object for convenience
export const tools = {
  getResume: getResumeTool,
  suggest_work_experience_improvement: suggestWorkExperienceTool,
  suggest_project_improvement: suggestProjectTool,
  suggest_skill_improvement: suggestSkillTool,
  suggest_education_improvement: suggestEducationTool,
  modifyWholeResume: modifyWholeResumeTool,

}; 