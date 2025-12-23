package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Schema(description = "Experience create DTO. path: /api/resumes/{resumeId}/experiences", example = """
                {
                  "jobTitle": "Software Engineer",
                  "companyName": "Tech Solutions Inc.",
                  "companyWebsite": "https://www.techsolutions.com",
                  "locationCity": "San Francisco",
                  "locationState": "CA",
                  "locationCountry": "USA",
                  "remote": true,
                  "employmentType": "FULL_TIME",
                  "startDate": "2020-01-15",
                  "endDate": "2023-08-31",
                  "currentlyWorking": false,
                  "description": "Worked on developing scalable web applications.",
                  "responsibilities": [
                    "Developed and maintained web applications using Java and Spring Boot.",
                    "Collaborated with cross-functional teams to define project requirements."
                  ],
                  "achievements": [
                    "Led the migration of legacy systems to modern cloud infrastructure.",
                    "Received Employee of the Month award in June 2021."
                  ],
                  "technologies": [
                    "Java", "Spring Boot", "Docker", "Kubernetes", "AWS"
                  ],
                  "methods": [
                    "Agile", "Scrum"
                  ],
                  "links": [
                    {
                      "title": "Project Portfolio",
                      "url": "https://www.github.com/username/portfolio"
                    }
                  ],
                  "managerName": "Jane Doe",
                  "managerContact": "+1 (987) 654-3210",
                  "teamSize": 8,
                  "seniorityLevel": "SENIOR",
                  "reportsToTitle": "Director of Engineering",
                  "confidential": false,
                  "starSituation": "A",
                  "starTask": "B",
                  "starResult": "C",
                  "kpiRevenueImpactUsd": 250000.00,
                  "kpiPercentImprovement": 20.5,
                  "kpiTimeSavedHours": 100,
                  "kpiUsers": 50,
                  "kpiArrUsd": 500000.00
                }
                """)
public record ExperienceDto(
                @NotBlank(message = "Job Title is required") String jobTitle,
                @NotBlank(message = "Company Name is required") String companyName,
                String companyWebsite,
                // legacy free-form location still accepted
                String location,
                String locationCity,
                String locationState,
                String locationCountry,
                Boolean remote,

                @Schema(allowableValues = {
                                "FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP",
                                "TEMPORARY" }) @NotBlank(message = "Employment Type is required") String employmentType,

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

                @Schema(allowableValues = { "INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "STAFF", "PRINCIPAL",
                                "MANAGER", "DIRECTOR", "VP", "C_LEVEL", "OTHER" }) String seniorityLevel,
                String reportsToTitle,

                Boolean confidential,

                // STAR fields
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