"use client";

import { Resume } from "@/lib/types";
import {
  Document as PDFDocument,
  Page as PDFPage,
  Text,
  View,
  StyleSheet,
  Link,
  Image,
  Font,
} from "@react-pdf/renderer";
import { memo, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { FontCapabilities } from "@/hooks/use-google-fonts";

// Base styles that don't depend on resume settings
const baseStyles = {
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  bulletSeparator: {
    color: "#4b5563",
    marginHorizontal: 2,
  },
  bulletDot: {
    width: 8,
    marginRight: 4,
  },
} as const;

// Cache for processed text nodes
const textProcessingCache = new Map<string, ReactNode[]>();

const getSafeStyle = (
  baseFont: string, 
  wantBold: boolean, 
  wantItalic: boolean, 
  caps: FontCapabilities | null
) => {
  // 1. Standard Fonts (Always safe)
  if (["Helvetica", "Times-Roman", "Courier"].includes(baseFont)) {
    const map: any = {
      'Helvetica': { b: 'Helvetica-Bold', i: 'Helvetica-Oblique', bi: 'Helvetica-BoldOblique' },
      'Times-Roman': { b: 'Times-Bold', i: 'Times-Italic', bi: 'Times-BoldItalic' },
      'Courier': { b: 'Courier-Bold', i: 'Courier-Oblique', bi: 'Courier-BoldOblique' }
    };
    if (wantBold && wantItalic) return { fontFamily: map[baseFont].bi };
    if (wantBold) return { fontFamily: map[baseFont].b };
    if (wantItalic) return { fontFamily: map[baseFont].i };
    return { fontFamily: baseFont };
  }

  // 2. Custom Fonts (Check Capabilities)
  const style: any = { fontFamily: baseFont };
  
  // Default to allowing everything if caps aren't loaded yet (optimistic), 
  // but strictly checking is safer if you want to avoid crashes 100%.
  const c = caps || { hasBold: true, hasItalic: true, hasBoldItalic: true }; 

  if (wantBold && wantItalic) {
    if (c.hasBoldItalic) {
      style.fontWeight = 'bold';
      style.fontStyle = 'italic';
    } else if (c.hasBold) {
      style.fontWeight = 'bold'; // Fallback: Bold only
    } else if (c.hasItalic) {
      style.fontStyle = 'italic'; // Fallback: Italic only
    }
    // Else: Regular
  } else if (wantBold) {
    if (c.hasBold) style.fontWeight = 'bold';
  } else if (wantItalic) {
    if (c.hasItalic) style.fontStyle = 'italic';
  }

  return style;
};

// --- UPDATED TEXT PROCESSOR ---
// Now accepts 'baseFont' to generate correct styles
function useTextProcessor(baseFont: string = "Helvetica", caps: FontCapabilities | null) {
  const processText = useCallback(
    (text: string, ignoreMarkdown = false) => {
      if (!text) return null;

      if (ignoreMarkdown) {
        return text.replace(/\*\*/g, "").replace(/<[^>]+>/g, "");
      }

      // Add baseFont to cache key so font changes trigger re-process
      const cacheKey = `v5-${baseFont}-${text}`;
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

        // Use dynamic font helper
        const style = {
          ...getSafeStyle(baseFont, isBold, isItalic, caps),
          textDecoration: isUnderline ? "underline" : "none",
        } as any;

        processed.push(
          <Text key={index} style={style}>
            {token}
          </Text>
        );
      });

      textProcessingCache.set(cacheKey, processed);
      return processed;
    },
    [baseFont]
  ); // Dependency updated

  return processText;
}

// Memoized section components
const HeaderSection = memo(function HeaderSection({
  resume,
  styles,
  baseFont,
  caps
}: {
  resume: Resume;
  styles: ReturnType<typeof createResumeStyles>;
  baseFont: string;
  caps: FontCapabilities | null;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.name}>
        {resume.first_name} {resume.last_name}
      </Text>
      <View style={styles.contactInfo}>
        {resume.location && (
          <>
            <Text>{resume.location}</Text>
            {(resume.email ||
              resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.email && (
          <>
            <Link src={`mailto:${resume.email}`}>
              <Text style={styles.link}>{resume.email}</Text>
            </Link>
            {(resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.phone_number && (
          <>
            <Text>{resume.phone_number}</Text>
            {(resume.website || resume.linkedin_url || resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.website && (
          <>
            <Link
              src={
                resume.website.startsWith("http")
                  ? resume.website
                  : `https://${resume.website}`
              }
            >
              <Text style={styles.link}>{resume.website}</Text>
            </Link>
            {(resume.linkedin_url || resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.linkedin_url && (
          <>
            <Link
              src={
                resume.linkedin_url.startsWith("http")
                  ? resume.linkedin_url
                  : `https://${resume.linkedin_url}`
              }
            >
              <Text style={styles.link}>{resume.linkedin_url}</Text>
            </Link>
            {resume.github_url && <Text style={styles.bulletSeparator}>•</Text>}
          </>
        )}
        {resume.github_url && (
          <Link
            src={
              resume.github_url.startsWith("http")
                ? resume.github_url
                : `https://${resume.github_url}`
            }
          >
            <Text style={styles.link}>{resume.github_url}</Text>
          </Link>
        )}
      </View>
    </View>
  );
});

const SkillsSection = memo(function SkillsSection({
  skills,
  styles,
  baseFont,
  caps,
}: {
  skills: Resume["skills"];
  styles: ReturnType<typeof createResumeStyles>;
  baseFont: string;
  caps: FontCapabilities | null;
}) {
  if (!skills?.length) return null;

  return (
    <View style={styles.skillsSection}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsGrid}>
        {skills.map((skillCategory, index) => (
          <View key={index} style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>
              {skillCategory.category}:
            </Text>
            <Text style={styles.skillItem}>
              {skillCategory.items.join(", ")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const ExperienceSection = memo(function ExperienceSection({
  experiences,
  styles,
  baseFont,
  caps,
}: {
  experiences: Resume["work_experience"];
  styles: ReturnType<typeof createResumeStyles>;
  baseFont: string;
  caps: FontCapabilities | null;
}) {
  const processText = useTextProcessor(baseFont, caps);
  if (!experiences?.length) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {experiences.map((experience, index) => (
        <View key={index} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <View>
              <Text style={styles.jobTitle}>
                {processText(experience.position, true)}
              </Text>
              <View style={styles.companyLocationRow}>
                <Text style={styles.companyName}>
                  {processText(experience.company, true)}
                </Text>
                {experience.location && (
                  <>
                    <Text style={styles.bulletSeparator}>•</Text>
                    <Text style={styles.locationText}>
                      {experience.location}
                    </Text>
                  </>
                )}
              </View>
            </View>
            <Text style={styles.dateRange}>{experience.date}</Text>
          </View>
          {experience.description.map((bullet, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(bullet)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const ProjectsSection = memo(function ProjectsSection({
  projects,
  styles,
  baseFont,
  caps,
}: {
  projects: Resume["projects"];
  styles: ReturnType<typeof createResumeStyles>;
  baseFont: string;
  caps: FontCapabilities | null;
}) {
  const processText = useTextProcessor(baseFont, caps);
  if (!projects?.length) return null;

  return (
    <View style={styles.projectsSection}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectItem}>
          <View style={styles.projectHeader}>
            <View style={styles.projectHeaderTop}>
              <Text style={styles.projectTitle}>
                {processText(project.name, true)}
              </Text>
              <View style={styles.projectHeaderRight}>
                {project.date && (
                  <Text style={styles.dateRange}>{project.date}</Text>
                )}
                {(project.url || project.github_url) && (
                  <Text style={styles.projectLinks}>
                    {project.url && (
                      <Link
                        src={
                          project.url.startsWith("http")
                            ? project.url
                            : `https://${project.url}`
                        }
                      >
                        <Text style={styles.link}>{project.url}</Text>
                      </Link>
                    )}
                    {project.url && project.github_url && " | "}
                    {project.github_url && (
                      <Link
                        src={
                          project.github_url.startsWith("http")
                            ? project.github_url
                            : `https://${project.github_url}`
                        }
                      >
                        <Text style={styles.link}>{project.github_url}</Text>
                      </Link>
                    )}
                  </Text>
                )}
              </View>
            </View>
            {project.technologies && (
              <Text style={styles.projectTechnologies}>
                {project.technologies
                  .map((tech) => tech.replace(/\*\*/g, ""))
                  .join(", ")}
              </Text>
            )}
          </View>

          {project.description.map((bullet, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(bullet)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const EducationSection = memo(function EducationSection({
  education,
  styles,
  baseFont,
  caps,
}: {
  education: Resume["education"];
  styles: ReturnType<typeof createResumeStyles>;
  baseFont: string;
  caps: FontCapabilities | null;
}) {
  const processText = useTextProcessor(baseFont, caps);
  if (!education?.length) return null;

  return (
    <View style={styles.educationSection}>
      <Text style={styles.sectionTitle}>Education</Text>
      {education.map((edu, index) => (
        <View key={index} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <View>
              <Text style={styles.schoolName}>
                {processText(edu.school, true)}
              </Text>
              <Text style={styles.degree}>
                {processText(`${edu.degree} ${edu.field}`)}
              </Text>
            </View>
            <Text style={styles.dateRange}>{edu.date}</Text>
          </View>
          {edu.achievements &&
            edu.achievements.map((achievement, bulletIndex) => (
              <View key={bulletIndex} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.bulletText}>
                  <Text style={styles.bulletTextContent}>
                    {processText(achievement)}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
});

// Style factory function
function createResumeStyles(
  settings: Resume["document_settings"] = {
    document_font_family: "Helvetica",
    document_font_size: 10,
    document_line_height: 1.5,
    document_margin_vertical: 36,
    document_margin_horizontal: 36,
    header_name_size: 24,
    header_name_bottom_spacing: 24,
    skills_margin_top: 2,
    skills_margin_bottom: 2,
    skills_margin_horizontal: 0,
    skills_item_spacing: 2,
    experience_margin_top: 2,
    experience_margin_bottom: 2,
    experience_margin_horizontal: 0,
    experience_item_spacing: 4,
    projects_margin_top: 2,
    projects_margin_bottom: 2,
    projects_margin_horizontal: 0,
    projects_item_spacing: 4,
    education_margin_top: 2,
    education_margin_bottom: 2,
    education_margin_horizontal: 0,
    education_item_spacing: 4,
    footer_width: 80,
  },
  caps: FontCapabilities | null
) {
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

  const boldStyle = getSafeStyle(document_font_family, true, false, caps) as any;
  const italicStyle = getSafeStyle(document_font_family, false, true, caps) as any;
  const boldItalicStyle = getSafeStyle(
    document_font_family,
    true,
    true,
    caps
  ) as any;

  return StyleSheet.create({
    ...baseStyles,
    // Base page configuration
    page: {
      paddingTop: document_margin_vertical,
      paddingBottom: document_margin_vertical + 28,
      paddingLeft: document_margin_horizontal,
      paddingRight: document_margin_horizontal,
      fontFamily: document_font_family,
      color: "#111827",
      fontSize: document_font_size,
      lineHeight: document_line_height,
      position: "relative",
      // backgroundColor: '#32a852',  // Bright green color that should be very visible for testing
    },
    header: {
      alignItems: "center",
    },
    name: {
      fontSize: header_name_size,
      ...boldStyle,
      marginBottom: header_name_bottom_spacing,
      color: "#111827",
      textAlign: "center",
    },
    contactInfo: {
      fontSize: document_font_size,
      color: "#374151",
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 4,
    },
    sectionTitle: {
      fontSize: document_font_size,
      ...boldStyle,
      marginBottom: 4,
      color: "#111827",
      textTransform: "uppercase",
      borderBottom: "0.5pt solid #e5e7eb",
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
      flexDirection: "column",
      gap: skills_item_spacing,
    },
    skillCategory: {
      marginBottom: skills_item_spacing,
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
    },
    skillCategoryTitle: {
      fontSize: document_font_size,
      ...boldStyle,
      color: "#111827",
      marginRight: 4,
      width: "auto",
    },
    skillItem: {
      fontSize: document_font_size,
      color: "#374151",
      flexGrow: 1,
      flexBasis: 0,
      flexWrap: "wrap",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    companyName: {
      fontSize: document_font_size,
      ...italicStyle,
      color: "#111827",
    },
    jobTitle: {
      fontSize: document_font_size,
      ...boldItalicStyle,
      color: "#111827",
    },
    companyLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    locationText: {
      fontSize: document_font_size,
      color: "#374151",
    },
    dateRange: {
      fontSize: document_font_size,
      color: "#111827",
      textAlign: "right",
    },
    bulletPoint: {
      fontSize: document_font_size,
      marginBottom: experience_item_spacing,
      color: "#111827",
      marginLeft: 8,
      paddingLeft: 8,
      flexDirection: "row",
    },
    bulletText: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      display: "flex",
    },
    bulletTextContent: {
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
      flexDirection: "column",
      marginBottom: 4,
    },
    projectHeaderTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    projectHeaderRight: {
      flexDirection: "row",
      gap: 8,
    },
    projectTitle: {
      fontSize: document_font_size,
      ...boldStyle,
      color: "#111827",
    },
    projectTechnologies: {
      fontSize: document_font_size - 1,
      color: "#374151",
      ...boldItalicStyle,
      marginBottom: 0,
    },
    projectDescription: {
      fontSize: document_font_size,
      color: "#111827",
    },
    projectLinks: {
      fontSize: document_font_size,
      color: "#374151",
      textAlign: "right",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    schoolName: {
      fontSize: document_font_size,
      ...boldStyle,
      color: "#111827",
    },
    degree: {
      fontSize: document_font_size,
      color: "#111827",
    },
    footer: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      height: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    footerImage: {
      width: `${footer_width}%`,
      height: "auto",
    },
  });
}

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: "base" | "tailored";
  fontCapabilities: FontCapabilities | null;
}

export const ResumePDFDocument = memo(
  function ResumePDFDocument({ resume, variant, fontCapabilities }: ResumePDFDocumentProps) {
    const styles = useMemo(
      () => createResumeStyles(resume.document_settings, fontCapabilities || null),
      [resume.document_settings, fontCapabilities]
    );

    const baseFont =
      resume.document_settings?.document_font_family || "Helvetica";

    return (
      <PDFDocument>
        <PDFPage size="LETTER" style={styles.page}>
          <HeaderSection resume={resume} styles={styles} baseFont={baseFont} caps={fontCapabilities} />
          <SkillsSection skills={resume.skills} styles={styles} baseFont={baseFont} caps={fontCapabilities}/>
          <ExperienceSection
            experiences={resume.work_experience}
            styles={styles}
            baseFont={baseFont}
            caps={fontCapabilities}
          />
          <ProjectsSection
            projects={resume.projects}
            styles={styles}
            baseFont={baseFont}
            caps={fontCapabilities}
          />
          <EducationSection
            education={resume.education}
            styles={styles}
            baseFont={baseFont}
            caps={fontCapabilities}
          />

          {resume.document_settings?.show_ubc_footer && (
            <View style={styles.footer}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image
                src="/images/ubc-science-footer.png"
                style={styles.footerImage}
              />
            </View>
          )}
        </PDFPage>
      </PDFDocument>
    );
  },
  (prevProps: ResumePDFDocumentProps, nextProps: ResumePDFDocumentProps) => {
    // Custom comparison function: shallow compare resume object reference, variant, and font capabilities
    return (
      prevProps.resume === nextProps.resume &&
      prevProps.variant === nextProps.variant &&
      prevProps.fontCapabilities === nextProps.fontCapabilities
    );
  }
);
