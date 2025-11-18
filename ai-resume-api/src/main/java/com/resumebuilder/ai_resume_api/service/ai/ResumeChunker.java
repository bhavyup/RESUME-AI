package com.resumebuilder.ai_resume_api.service.ai;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // add this import

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class ResumeChunker {

    private final ResumeRepository resumeRepository;

    public ResumeChunker(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // ADD THIS ANNOTATION
    @Transactional(readOnly = true)
    public List<Chunk> buildChunks(Long resumeId) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("Resume not found"));

        List<Chunk> out = new ArrayList<>();
        int order = 0;

        // SUMMARY
        if (notBlank(resume.getProfessionalSummary())) {
            out.add(new Chunk(resume.getId(), "SUMMARY", "SUMMARY_TEXT", null, order++,
                    normalize(resume.getProfessionalSummary())));
        }
        if (notBlank(resume.getResumeHeadline())) {
            out.add(new Chunk(resume.getId(), "SUMMARY", "SUMMARY_HEADLINE", null, order++,
                    normalize(resume.getResumeHeadline())));
        }
        if (notBlank(resume.getTitle())) {
            out.add(new Chunk(resume.getId(), "SUMMARY", "SUMMARY_TITLE", null, order++, normalize(resume.getTitle())));
        }

        // EXPERIENCE
        if (resume.getExperiences() != null) {
            for (ExperienceEntity exp : resume.getExperiences()) {
                String header = buildExpHeader(exp);
                if (notBlank(header)) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_HEADER", exp.getId(), 0, header));
                }

                int bi = 0;
                if (exp.getResponsibilities() != null) {
                    for (String b : exp.getResponsibilities()) {
                        if (notBlank(b)) {
                            out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_BULLET", exp.getId(), bi++,
                                    normalize(b)));
                        }
                    }
                }

                int ai = 0;
                if (exp.getAchievements() != null) {
                    for (String a : exp.getAchievements()) {
                        if (notBlank(a)) {
                            out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_ACHIEVEMENT", exp.getId(), ai++,
                                    normalize(a)));
                        }
                    }
                }

                String techLine = joinList(exp.getTechnologies(), ", ", 64);
                if (notBlank(techLine)) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_TECH_STACK", exp.getId(), 0, techLine));
                }
                String methodsLine = joinList(exp.getMethods(), ", ", 64);
                if (notBlank(methodsLine)) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_METHODS", exp.getId(), 0, methodsLine));
                }

                if (notBlank(exp.getStarSituation())) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_STAR_SITUATION", exp.getId(), 0,
                            normalize(exp.getStarSituation())));
                }
                if (notBlank(exp.getStarTask())) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_STAR_TASK", exp.getId(), 0,
                            normalize(exp.getStarTask())));
                }
                if (notBlank(exp.getStarAction())) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_STAR_ACTION", exp.getId(), 0,
                            normalize(exp.getStarAction())));
                }
                if (notBlank(exp.getStarResult())) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_STAR_RESULT", exp.getId(), 0,
                            normalize(exp.getStarResult())));
                }

                boolean hasResp = exp.getResponsibilities() != null && !exp.getResponsibilities().isEmpty();
                boolean hasAch = exp.getAchievements() != null && !exp.getAchievements().isEmpty();
                if (!hasResp && !hasAch && notBlank(exp.getDescription())) {
                    out.add(new Chunk(resume.getId(), "EXPERIENCE", "EXPERIENCE_DESC", exp.getId(), 0,
                            normalize(exp.getDescription())));
                }
            }
        }

        // PROJECTS
        if (resume.getProjects() != null) {
            for (ProjectEntity pr : resume.getProjects()) {
                String pHeader = buildProjectHeader(pr);
                if (notBlank(pHeader)) {
                    out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_HEADER", pr.getId(), 0, pHeader));
                }

                int fi = 0;
                if (pr.getFeatures() != null) {
                    for (String f : pr.getFeatures()) {
                        if (notBlank(f)) {
                            out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_FEATURE", pr.getId(), fi++,
                                    normalize(f)));
                        }
                    }
                }
                if (notBlank(pr.getShortDescription())) {
                    out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_SHORT_DESC", pr.getId(), fi,
                            normalize(pr.getShortDescription())));
                }
                if (notBlank(pr.getOutcomeSummary())) {
                    out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_OUTCOME", pr.getId(), fi,
                            normalize(pr.getOutcomeSummary())));
                }

                String projTech = joinList(pr.getTechnologies(), ", ", 64);
                if (notBlank(projTech)) {
                    out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_TECH_STACK", pr.getId(), 0, projTech));
                }

                String impact = buildProjectImpact(pr);
                if (notBlank(impact)) {
                    out.add(new Chunk(resume.getId(), "PROJECT", "PROJECT_IMPACT_METRICS", pr.getId(), 0, impact));
                }
            }
        }

        // SKILLS
        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            String skillLine = resume.getSkills().stream()
                    .map(SkillEntity::getName)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .limit(128)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse(null);
            if (notBlank(skillLine)) {
                out.add(new Chunk(resume.getId(), "SKILL", "SKILL_LINE", null, 0, normalize(skillLine)));
            }
        }

        if (resume.getSkillCategories() != null) {
            for (SkillCategoryEntity cat : resume.getSkillCategories()) {
                String catName = safe(cat.getName());
                if (cat.getSkills() != null && !cat.getSkills().isEmpty()) {
                    String catSkills = cat.getSkills().stream()
                            .map(SkillEntity::getName)
                            .filter(Objects::nonNull)
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .distinct()
                            .limit(64)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("");
                    String catLine = (catName.isEmpty() ? "" : (catName + ": ")) + catSkills;
                    if (notBlank(catLine)) {
                        out.add(new Chunk(resume.getId(), "SKILL", "SKILL_CATEGORY_LINE", cat.getId(), 0,
                                normalize(catLine)));
                    }
                }
            }
        }

        // EDUCATION
        if (resume.getEducations() != null) {
            for (EducationEntity ed : resume.getEducations()) {
                String header = buildEduHeader(ed);
                if (notBlank(header)) {
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_LINE", ed.getId(), 0, header));
                }
                if (notBlank(ed.getDescription())) {
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_DESC", ed.getId(), 1,
                            normalize(ed.getDescription())));
                }
                String courses = joinList(ed.getCourses(), ", ", 32);
                if (notBlank(courses)) {
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_COURSE_LINE", ed.getId(), 2, courses));
                }
                if (ed.isShowHonors() && notBlank(ed.getHonors())) {
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_HONORS", ed.getId(), 3,
                            normalize(ed.getHonors())));
                }
                if (ed.isShowGpa() && ed.getGpa() != null) {
                    String gpaLine = "GPA: " + String.format(Locale.US, "%.2f", ed.getGpa());
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_GPA", ed.getId(), 4, gpaLine));
                }
                if (notBlank(ed.getGradeClass())) {
                    out.add(new Chunk(resume.getId(), "EDUCATION", "EDU_GRADE_CLASS", ed.getId(), 5,
                            normalize(ed.getGradeClass())));
                }
            }
        }

        return out;
    }

    private String buildExpHeader(ExperienceEntity exp) {
        String title = safe(exp.getJobTitle());
        String company = safe(exp.getCompanyName());
        if (title.isEmpty() && company.isEmpty())
            return "";
        String base = (title.isEmpty() ? "" : title) + (company.isEmpty() ? "" : " at " + company);
        return base.trim();
    }

    private String buildProjectHeader(ProjectEntity pr) {
        String title = safe(pr.getTitle());
        if (title.isEmpty())
            return "";
        return ("Project: " + title).trim();
    }

    private String buildProjectImpact(ProjectEntity pr) {
        List<String> lines = new ArrayList<>();
        if (pr.getDownloadsCount() != null)
            lines.add("Downloads: " + pr.getDownloadsCount());
        if (pr.getUsersCount() != null)
            lines.add("Users: " + pr.getUsersCount());
        if (pr.getStarsCount() != null)
            lines.add("Stars: " + pr.getStarsCount());
        if (pr.getRevenueImpactUsd() != null)
            lines.add("Revenue impact: $" + pr.getRevenueImpactUsd());
        return String.join(", ", lines);
    }

    private String buildEduHeader(EducationEntity ed) {
        String degree = safe(ed.getDegree());
        String field = safe(ed.getFieldOfStudy());
        String inst = safe(ed.getInstitution());
        String header = (degree + " " + field).trim();
        if (!inst.isEmpty())
            header = (header.isEmpty() ? "" : header + " ") + "at " + inst;
        return header.trim();
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private String normalize(String s) {
        return s == null ? "" : s.replaceAll("\\s+", " ").trim();
    }

    private String joinList(List<String> list, String sep, int maxItems) {
        if (list == null || list.isEmpty())
            return "";
        return list.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .limit(maxItems)
                .reduce((a, b) -> a + sep + b)
                .orElse("");
    }

    public record Chunk(Long resumeId, String section, String refType, Long refId, int partOrder, String content) {
    }
}