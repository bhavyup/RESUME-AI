package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.dto.PersonalInfoDto;
import com.resumebuilder.ai_resume_api.dto.SubscriptionStatusDto;
import com.resumebuilder.ai_resume_api.dto.resume.ResumeSummaryDto;
import com.resumebuilder.ai_resume_api.mapper.UserMapper;
import com.resumebuilder.ai_resume_api.service.SubscriptionService;
import com.resumebuilder.ai_resume_api.service.profile.PersonalInfoService;
import com.resumebuilder.ai_resume_api.service.resume.ResumeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Dashboard", description = "Dashboard data aggregation")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final PersonalInfoService personalInfoService;
    private final ResumeService resumeService;
    private final SubscriptionService subscriptionService;
    private final UserMapper userMapper;

    public DashboardController(
            PersonalInfoService personalInfoService,
            ResumeService resumeService,
            SubscriptionService subscriptionService,
            UserMapper userMapper) {
        this.personalInfoService = personalInfoService;
        this.resumeService = resumeService;
        this.subscriptionService = subscriptionService;
        this.userMapper = userMapper;
    }

    @GetMapping
    @Operation(summary = "Get all dashboard data for authenticated user")
    public ResponseEntity<DashboardDataDto> getDashboardData() {
        var personalInfo = personalInfoService.getPersonalInfo();
        var resumes = resumeService.listMyResumes();
        var subscription = subscriptionService.getCurrentSubscriptionStatus();

        PersonalInfoDto profileDto = personalInfo != null
                ? userMapper.toDto(personalInfo)
                : null;

        return ResponseEntity.ok(new DashboardDataDto(profileDto, resumes, subscription));
    }

    public record DashboardDataDto(
            PersonalInfoDto profile,
            List<ResumeSummaryDto> resumes,
            SubscriptionStatusDto subscription) {
    }
}