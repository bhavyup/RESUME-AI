package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.dto.PersonalInfoDto;
import com.resumebuilder.ai_resume_api.dto.PersonalInfoRequestDto;
import com.resumebuilder.ai_resume_api.mapper.UserMapper;
import com.resumebuilder.ai_resume_api.service.profile.PersonalInfoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Personal Info", description = "Create/Update personal profile information")
@RestController
@RequestMapping("/api/info")
public class PersonalInfoController {
    private final PersonalInfoService personalInfoService;
    private final UserMapper userMapper;

    public PersonalInfoController(PersonalInfoService personalInfoService, UserMapper userMapper) {
        this.personalInfoService = personalInfoService;
        this.userMapper = userMapper;
    }

    @PutMapping
    @Operation(summary = "Create or update personal info for current user")
    public ResponseEntity<PersonalInfoDto> createOrUpdateInfo(@Valid @RequestBody PersonalInfoRequestDto requestDto) {
        var updatedInfo = personalInfoService.createOrUpdatePersonalInfo(requestDto);
        return ResponseEntity.ok(userMapper.toDto(updatedInfo));
    }

    @GetMapping
    @Operation(summary = "Get personal info for current user")
    public ResponseEntity<PersonalInfoDto> getPersonalInfo() {
        var info = personalInfoService.getPersonalInfo();
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userMapper.toDto(info));
    }
}