package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Schema(description = "Update DTO for Experience with optimistic locking", example = """
                {
                  "version": 2,
                  "jobTitle": "Senior Software Engineer",
                  "companyName": "Tech Solutions Inc.",
                  "companyWebsite": "https://www.techsolutions.com",
                  "location": "New York, NY, USA",
                  "locationCity": "New York",
                  "locationState": "NY",
                  "locationCountry": "USA",
                  "remote": true,
                  "employmentType": "FULL_TIME",
                  "startDate": "2020-05-01",
                  "endDate": "2023-08-31",
                  "currentlyWorking": false,
                  "description": "Led a team of developers to build scalable web applications.",
                  "responsibilities": [
                    "Developed and maintained web applications using Java and Spring Boot.",
                    "Collaborated with cross-functional teams to define project requirements."
                  ],
                  "achievements": [
                    "Increased application performance by 30% through code optimization.",
                    "Mentored junior developers, resulting in a 20% improvement in team productivity."
                  ],
                  "technologies": [
                    "Java", "Spring Boot", "Docker", "Kubernetes"
                  ],
                  "methods": [
                    "Agile", "Scrum"
                  ],
                  "links": [
                    {
                      "title": "Project Repository",
                      "url": "https://github.com/techsolutions/project"
                    }
                  ],
                  "managerName": "John Doe",
                  "managerContact": "+1 (123) 456-7890",
                  "teamSize": 10,
                  "seniorityLevel": "SENIOR",
                  "reportsToTitle": "Project Manager",
                  "confidential": false,
                  "starSituation": "YES",
                  "starTask": "YES",
                  "starAction": "YES",
                  "starResult": "YES",
                  "kpiRevenueImpactUsd": 500000.00,
                  "kpiPercentImprovement": 15.5,
                  "kpiTimeSavedHours": 200,
                  "kpiUsers": 10000,
                  "kpiArrUsd": 1000000.00
        }
                """)
public record ExperienceUpdateDto(
        @NotNull @Schema(description = "Current version for optimistic locking", example = "2") Long version,

        @NotBlank(message = "Job Title is required") String jobTitle,
        @NotBlank(message = "Company Name is required") String companyName,
        String companyWebsite,
        String location,
        String locationCity,
        String locationState,
        String locationCountry,
        Boolean remote,

        @Schema(allowableValues = {
                "FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP", "TEMPORARY" }) @NotBlank(message = "Employment Type is required") String employmentType,

        LocalDate startDate,
        LocalDate endDate,
        Boolean currentlyWorking,

        String description,
        List<String> responsibilities,
        List<String> achievements,
        List<String> technologies,
        List<String> methods,
        List<ExperienceLinkDto> links,

        String managerName,
        String managerContact,
        Integer teamSize,

        @Schema(allowableValues = { "INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "STAFF", "PRINCIPAL", "MANAGER",
                "DIRECTOR", "VP", "C_LEVEL", "OTHER" }) String seniorityLevel,
        String reportsToTitle,

        Boolean confidential,

        // STAR
        String starSituation,
        String starTask,
        String starAction,
        String starResult,

        // KPIs
        BigDecimal kpiRevenueImpactUsd,
        BigDecimal kpiPercentImprovement,
        Integer kpiTimeSavedHours,
        Integer kpiUsers,
        BigDecimal kpiArrUsd){
}