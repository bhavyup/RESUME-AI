package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ExperienceDto;
import com.resumebuilder.ai_resume_api.dto.resume.ExperienceResponseDto;
import com.resumebuilder.ai_resume_api.service.resume.ExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/resumes/{resumeId}/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @Operation(summary = "Add experience to resume")
    @PostMapping
    public ResponseEntity<ExperienceResponseDto> addExperience(@PathVariable Long resumeId,
            @Valid @RequestBody ExperienceDto experienceDto) {
        var dto = experienceService.addExperienceToResume(resumeId, experienceDto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/experiences/" + dto.id())).body(dto);
    }

    @Operation(summary = "Update experience (optimistic locking)")
    @PutMapping("/{experienceId}")
    public ResponseEntity<ExperienceResponseDto> updateExperience(@PathVariable Long resumeId,
            @PathVariable Long experienceId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.resume.ExperienceUpdateDto experienceDto) {
        var dto = experienceService.updateExperience(resumeId, experienceId, experienceDto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Delete experience")
    @DeleteMapping("/{experienceId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long resumeId, @PathVariable Long experienceId) {
        experienceService.deleteExperience(resumeId, experienceId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder experiences")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderExperiences(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        experienceService.reorderExperiences(resumeId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List experiences for a resume (ordered)")
    @GetMapping
    public ResponseEntity<java.util.List<ExperienceResponseDto>> list(@PathVariable Long resumeId) {
        var list = experienceService.listExperiences(resumeId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Get an experience by id for a resume")
    @GetMapping("/{experienceId}")
    public ResponseEntity<ExperienceResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long experienceId) {
        var dto = experienceService.getExperience(resumeId, experienceId);
        return ResponseEntity.ok(dto);
    }
}