// src/components/resume/editor/preview/resume-html-document.tsx
"use client";

import { Resume } from "@/lib/types";
import { memo, useMemo, useCallback, ReactNode, CSSProperties } from "react";

// Cache for processed text nodes
const textProcessingCache = new Map<string, ReactNode[]>();

/**
 * Text processor hook for HTML rendering
 * Handles markdown-like formatting (**bold**, <strong>, <em>, etc.)
 */
function useTextProcessor() {
  const processText = useCallback(
    (text: string, ignoreMarkdown = false): ReactNode => {
      if (!text) return null;

      if (ignoreMarkdown) {
        return text.replace(/\*\*/g, "").replace(/<[^>]+>/g, "");
      }

      const cacheKey = `html-v1-${text}`;
      if (textProcessingCache.has(cacheKey)) {
        return textProcessingCache.get(cacheKey);
      }

      const cleanText = text.replace(/<\/?p>/g, "");
      const hasFormatting = /(\*\*|<(?:strong|b|em|i|u))/.test(cleanText);

      if (!hasFormatting) return cleanText;

      const tokens = cleanText.split(/(\*\*|<\/?(?:strong|b|em|i|u)[^>]*>)/g);
      const processed: ReactNode[] = [];

      let isBold = false;
      let isItalic = false;
      let isUnderline = false;

      tokens.forEach((token, index) => {
        if (!token) return;

        if (token.match(/^<(strong|b)/) || (token === "**" && !isBold)) {
          isBold = true;
          return;
        }
        if (token.match(/^<\/(strong|b)/) || (token === "**" && isBold)) {
          isBold = false;
          return;
        }
        if (token.match(/^<(em|i)/)) {
          isItalic = true;
          return;
        }
        if (token.match(/^<\/(em|i)/)) {
          isItalic = false;
          return;
        }
        if (token.match(/^<u/)) {
          isUnderline = true;
          return;
        }
        if (token.match(/^<\/u/)) {
          isUnderline = false;
          return;
        }

        const style: CSSProperties = {};
        if (isBold) style.fontWeight = "bold";
        if (isItalic) style.fontStyle = "italic";
        if (isUnderline) style.textDecoration = "underline";

        processed.push(
          <span
            key={index}
            style={Object.keys(style).length > 0 ? style : undefined}
          >
            {token}
          </span>
        );
      });

      textProcessingCache.set(cacheKey, processed);
      return processed;
    },
    []
  );

  return processText;
}

// Type for styles object
type ResumeStyles = ReturnType<typeof createResumeStyles>;

// ============== SECTION COMPONENTS ==============

const HeaderSection = memo(function HeaderSection({
  resume,
  styles,
}: {
  resume: Resume;
  styles: ResumeStyles;
}) {
  return (
    <header style={styles.header}>
      <h1 style={styles.name}>
        {resume.first_name} {resume.last_name}
      </h1>
      <div style={styles.contactInfo}>
        {resume.location && (
          <>
            <span>{resume.location}</span>
            {(resume.email ||
              resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <span style={styles.bulletSeparator}>•</span>
            )}
          </>
        )}
        {resume.email && (
          <>
            <a href={`mailto:${resume.email}`} style={styles.link}>
              {resume.email}
            </a>
            {(resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <span style={styles.bulletSeparator}>•</span>
            )}
          </>
        )}
        {resume.phone_number && (
          <>
            <span>{resume.phone_number}</span>
            {(resume.website || resume.linkedin_url || resume.github_url) && (
              <span style={styles.bulletSeparator}>•</span>
            )}
          </>
        )}
        {resume.website && (
          <>
            <a
              href={
                resume.website.startsWith("http")
                  ? resume.website
                  : `https://${resume.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {resume.website}
            </a>
            {(resume.linkedin_url || resume.github_url) && (
              <span style={styles.bulletSeparator}>•</span>
            )}
          </>
        )}
        {resume.linkedin_url && (
          <>
            <a
              href={
                resume.linkedin_url.startsWith("http")
                  ? resume.linkedin_url
                  : `https://${resume.linkedin_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {resume.linkedin_url}
            </a>
            {resume.github_url && <span style={styles.bulletSeparator}>•</span>}
          </>
        )}
        {resume.github_url && (
          <a
            href={
              resume.github_url.startsWith("http")
                ? resume.github_url
                : `https://${resume.github_url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {resume.github_url}
          </a>
        )}
      </div>
    </header>
  );
});

const SkillsSection = memo(function SkillsSection({
  skills,
  styles,
}: {
  skills: Resume["skills"];
  styles: ResumeStyles;
}) {
  if (!skills?.length) return null;

  return (
    <section style={styles.skillsSection}>
      <h2 style={styles.sectionTitle}>Skills</h2>
      <div style={styles.skillsGrid}>
        {skills.map((skillCategory, index) => (
          <div key={index} style={styles.skillCategory}>
            <span style={styles.skillCategoryTitle}>
              {skillCategory.category}:
            </span>
            <span style={styles.skillItem}>
              {skillCategory.items.join(", ")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
});

const ExperienceSection = memo(function ExperienceSection({
  experiences,
  styles,
}: {
  experiences: Resume["work_experience"];
  styles: ResumeStyles;
}) {
  const processText = useTextProcessor();
  if (!experiences?.length) return null;

  return (
    <section style={styles.experienceSection}>
      <h2 style={styles.sectionTitle}>Experience</h2>
      {experiences.map((experience, index) => (
        <article key={index} style={styles.experienceItem}>
          <div style={styles.experienceHeader}>
            <div>
              <div style={styles.jobTitle}>
                {processText(experience.position, true)}
              </div>
              <div style={styles.companyLocationRow}>
                <span style={styles.companyName}>
                  {processText(experience.company, true)}
                </span>
                {experience.location && (
                  <>
                    <span style={styles.bulletSeparator}>•</span>
                    <span style={styles.locationText}>
                      {experience.location}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span style={styles.dateRange}>{experience.date}</span>
          </div>
          <ul style={styles.bulletList}>
            {experience.description.map((bullet, bulletIndex) => (
              <li key={bulletIndex} style={styles.bulletPoint}>
                <span style={styles.bulletDot}>•</span>
                <span style={styles.bulletText}>{processText(bullet)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
});

const ProjectsSection = memo(function ProjectsSection({
  projects,
  styles,
}: {
  projects: Resume["projects"];
  styles: ResumeStyles;
}) {
  const processText = useTextProcessor();
  if (!projects?.length) return null;

  return (
    <section style={styles.projectsSection}>
      <h2 style={styles.sectionTitle}>Projects</h2>
      {projects.map((project, index) => (
        <article key={index} style={styles.projectItem}>
          <div style={styles.projectHeader}>
            <div style={styles.projectHeaderTop}>
              <span style={styles.projectTitle}>
                {processText(project.name, true)}
              </span>
              <div style={styles.projectHeaderRight}>
                {project.date && (
                  <span style={styles.dateRange}>{project.date}</span>
                )}
                {(project.url || project.github_url) && (
                  <span style={styles.projectLinks}>
                    {project.url && (
                      <a
                        href={
                          project.url.startsWith("http")
                            ? project.url
                            : `https://${project.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        {project.url}
                      </a>
                    )}
                    {project.url && project.github_url && " | "}
                    {project.github_url && (
                      <a
                        href={
                          project.github_url.startsWith("http")
                            ? project.github_url
                            : `https://${project.github_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        {project.github_url}
                      </a>
                    )}
                  </span>
                )}
              </div>
            </div>
            {project.technologies && project.technologies.length > 0 && (
              <div style={styles.projectTechnologies}>
                {project.technologies
                  .map((tech) => tech.replace(/\*\*/g, ""))
                  .join(", ")}
              </div>
            )}
          </div>
          <ul style={styles.bulletList}>
            {project.description.map((bullet, bulletIndex) => (
              <li key={bulletIndex} style={styles.bulletPoint}>
                <span style={styles.bulletDot}>•</span>
                <span style={styles.bulletText}>{processText(bullet)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
});

const EducationSection = memo(function EducationSection({
  education,
  styles,
}: {
  education: Resume["education"];
  styles: ResumeStyles;
}) {
  const processText = useTextProcessor();
  if (!education?.length) return null;

  return (
    <section style={styles.educationSection}>
      <h2 style={styles.sectionTitle}>Education</h2>
      {education.map((edu, index) => (
        <article key={index} style={styles.educationItem}>
          <div style={styles.educationHeader}>
            <div>
              <div style={styles.schoolName}>
                {processText(edu.school, true)}
              </div>
              <div style={styles.degree}>
                {processText(`${edu.degree} ${edu.field}`)}
              </div>
            </div>
            <span style={styles.dateRange}>{edu.date}</span>
          </div>
          {edu.achievements && edu.achievements.length > 0 && (
            <ul style={styles.bulletList}>
              {edu.achievements.map((achievement, bulletIndex) => (
                <li key={bulletIndex} style={styles.bulletPoint}>
                  <span style={styles.bulletDot}>•</span>
                  <span style={styles.bulletText}>
                    {processText(achievement)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
});

// ============== STYLE FACTORY ==============

/**
 * Maps PDF font families to web-safe equivalents
 */
function getWebFontFamily(pdfFont: string): string {
  switch (pdfFont) {
    case "Helvetica":
      return "Helvetica, Arial, sans-serif";
    case "Times-Roman":
      return '"Times New Roman", Times, serif';
    case "Courier":
      return '"Courier New", Courier, monospace';
    default:
      // For Google Fonts or other custom fonts
      return `"${pdfFont}", sans-serif`;
  }
}

/**
 * Creates inline styles object based on resume document settings
 * Mirrors the PDF styles but for HTML rendering
 */
function createResumeStyles(settings: Resume["document_settings"]) {
  const {
    document_font_family = "Helvetica",
    document_font_size = 10,
    document_line_height = 1.5,
    document_margin_vertical = 36,
    document_margin_horizontal = 36,
    header_name_size = 24,
    header_name_bottom_spacing = 24,
    skills_margin_top = 2,
    skills_margin_bottom = 2,
    skills_margin_horizontal = 0,
    skills_item_spacing = 2,
    experience_margin_top = 2,
    experience_margin_bottom = 2,
    experience_margin_horizontal = 0,
    experience_item_spacing = 4,
    projects_margin_top = 2,
    projects_margin_bottom = 2,
    projects_margin_horizontal = 0,
    projects_item_spacing = 4,
    education_margin_top = 2,
    education_margin_bottom = 2,
    education_margin_horizontal = 0,
    education_item_spacing = 4,
    footer_width = 95,
  } = settings || {};

  const webFontFamily = getWebFontFamily(document_font_family);

  return {
    // Page container - simulates a Letter-sized page
    page: {
      paddingTop: document_margin_vertical,
      paddingBottom: document_margin_vertical + 28,
      paddingLeft: document_margin_horizontal,
      paddingRight: document_margin_horizontal,
      fontFamily: webFontFamily,
      color: "#111827",
      fontSize: document_font_size,
      lineHeight: document_line_height,
      position: "relative" as const,
      backgroundColor: "#ffffff",
      // Use fixed pixel dimensions (8.5" x 11" at 96 DPI)
      width: 816,
      height: 1056,
      boxSizing: "border-box" as const,
      overflow: "hidden" as const,
    },

    // Header styles
    header: {
      display: "flex" as const,
      flexDirection: "column" as const,
      alignItems: "center" as const,
    },
    name: {
      fontSize: header_name_size,
      fontWeight: "bold" as const,
      marginBottom: header_name_bottom_spacing,
      marginTop: 0,
      color: "#111827",
      textAlign: "center" as const,
    },
    contactInfo: {
      fontSize: document_font_size,
      color: "#374151",
      display: "flex" as const,
      flexDirection: "row" as const,
      justifyContent: "center" as const,
      flexWrap: "wrap" as const,
      gap: 4,
    },

    // Common styles
    link: {
      color: "#2563eb",
      textDecoration: "none" as const,
    },
    bulletSeparator: {
      color: "#4b5563",
      marginLeft: 2,
      marginRight: 2,
    },
    sectionTitle: {
      fontSize: document_font_size,
      fontWeight: "bold" as const,
      marginBottom: 4,
      marginTop: 0,
      color: "#111827",
      textTransform: "uppercase" as const,
      borderBottom: "0.5px solid #e5e7eb",
      paddingBottom: 0,
    },

    // Skills section
    skillsSection: {
      marginTop: skills_margin_top,
      marginBottom: skills_margin_bottom,
      marginLeft: skills_margin_horizontal,
      marginRight: skills_margin_horizontal,
    },
    skillsGrid: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: skills_item_spacing,
    },
    skillCategory: {
      marginBottom: skills_item_spacing,
      display: "flex" as const,
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      width: "100%",
    },
    skillCategoryTitle: {
      fontSize: document_font_size,
      fontWeight: "bold" as const,
      color: "#111827",
      marginRight: 4,
    },
    skillItem: {
      fontSize: document_font_size,
      color: "#374151",
      flex: 1,
    },

    // Experience section
    experienceSection: {
      marginTop: experience_margin_top,
      marginBottom: experience_margin_bottom,
      marginLeft: experience_margin_horizontal,
      marginRight: experience_margin_horizontal,
    },
    experienceItem: {
      marginBottom: experience_item_spacing,
    },
    experienceHeader: {
      display: "flex" as const,
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 4,
    },
    companyName: {
      fontSize: document_font_size,
      fontStyle: "italic" as const,
      color: "#111827",
    },
    jobTitle: {
      fontSize: document_font_size,
      fontWeight: "bold" as const,
      fontStyle: "italic" as const,
      color: "#111827",
    },
    companyLocationRow: {
      display: "flex" as const,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
    },
    locationText: {
      fontSize: document_font_size,
      color: "#374151",
    },
    dateRange: {
      fontSize: document_font_size,
      color: "#111827",
      textAlign: "right" as const,
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    },

    // Bullet list styles
    bulletList: {
      margin: 0,
      padding: 0,
      listStyle: "none" as const,
    },
    bulletPoint: {
      fontSize: document_font_size,
      marginBottom: 2,
      color: "#111827",
      marginLeft: 8,
      paddingLeft: 8,
      display: "flex" as const,
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
    },
    bulletDot: {
      width: 8,
      marginRight: 4,
      flexShrink: 0,
    },
    bulletText: {
      flex: 1,
    },

    // Projects section
    projectsSection: {
      marginTop: projects_margin_top,
      marginBottom: projects_margin_bottom,
      marginLeft: projects_margin_horizontal,
      marginRight: projects_margin_horizontal,
    },
    projectItem: {
      marginBottom: projects_item_spacing,
    },
    projectHeader: {
      display: "flex" as const,
      flexDirection: "column" as const,
      marginBottom: 4,
    },
    projectHeaderTop: {
      display: "flex" as const,
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 2,
    },
    projectHeaderRight: {
      display: "flex" as const,
      flexDirection: "row" as const,
      gap: 8,
      alignItems: "center" as const,
      flexShrink: 0,
    },
    projectTitle: {
      fontSize: document_font_size,
      fontWeight: "bold" as const,
      color: "#111827",
    },
    projectTechnologies: {
      fontSize: document_font_size - 1,
      color: "#374151",
      fontWeight: "bold" as const,
      fontStyle: "italic" as const,
    },
    projectLinks: {
      fontSize: document_font_size,
      color: "#374151",
      textAlign: "right" as const,
    },

    // Education section
    educationSection: {
      marginTop: education_margin_top,
      marginBottom: education_margin_bottom,
      marginLeft: education_margin_horizontal,
      marginRight: education_margin_horizontal,
    },
    educationItem: {
      marginBottom: education_item_spacing,
    },
    educationHeader: {
      display: "flex" as const,
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 4,
    },
    schoolName: {
      fontSize: document_font_size,
      fontWeight: "bold" as const,
      color: "#111827",
    },
    degree: {
      fontSize: document_font_size,
      color: "#111827",
    },

    // Footer
    footer: {
      position: "absolute" as const,
      bottom: 20,
      left: 0,
      right: 0,
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    footerImage: {
      width: `${footer_width}%`,
      height: "auto" as const,
    },
  };
}

// ============== MAIN COMPONENT ==============

interface ResumeHTMLDocumentProps {
  resume: Resume;
  variant?: "base" | "tailored";
  className?: string;
}

export const ResumeHTMLDocument = memo(
  function ResumeHTMLDocument({
    resume,
    variant = "base",
    className,
  }: ResumeHTMLDocumentProps) {
    const styles = useMemo(
      () => createResumeStyles(resume.document_settings),
      [resume.document_settings]
    );

    return (
      <article style={styles.page} className={className} data-variant={variant}>
        <HeaderSection resume={resume} styles={styles} />
        <SkillsSection skills={resume.skills} styles={styles} />
        <ExperienceSection
          experiences={resume.work_experience}
          styles={styles}
        />
        <ProjectsSection projects={resume.projects} styles={styles} />
        <EducationSection education={resume.education} styles={styles} />

        {resume.document_settings?.show_ubc_footer && (
          <div style={styles.footer}>
            <img
              src="/images/ubc-science-footer.png"
              style={styles.footerImage}
              alt="UBC Science Footer"
            />
          </div>
        )}
      </article>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.resume === nextProps.resume &&
      prevProps.variant === nextProps.variant &&
      prevProps.className === nextProps.className
    );
  }
);

export default ResumeHTMLDocument;
