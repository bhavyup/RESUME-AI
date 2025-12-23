package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.EducationDto;
import com.resumebuilder.ai_resume_api.dto.resume.EducationResponseDto;
import com.resumebuilder.ai_resume_api.service.resume.EducationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/resumes/{resumeId}/educations")
public class EducationController {
    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    @Operation(summary = "Add education to resume")
    @PostMapping
    public ResponseEntity<EducationResponseDto> addEducation(@PathVariable Long resumeId,
            @Valid @RequestBody EducationDto educationDto) {
        var dto = educationService.addEducationToResume(resumeId, educationDto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/educations/" + dto.id())).body(dto);
    }

    @Operation(summary = "Update education in resume (optimistic locking)")
    @PutMapping("/{educationId}")
    public ResponseEntity<EducationResponseDto> updateEducation(@PathVariable Long resumeId,
            @PathVariable Long educationId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.resume.EducationUpdateDto educationDto) {
        var dto = educationService.updateEducation(resumeId, educationId, educationDto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Delete education from resume")
    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long resumeId, @PathVariable Long educationId) {
        educationService.deleteEducation(resumeId, educationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder educations")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderEducations(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        educationService.reorderEducations(resumeId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List educations for a resume (ordered)")
    @GetMapping
    public ResponseEntity<java.util.List<EducationResponseDto>> list(@PathVariable Long resumeId) {
        var list = educationService.listEducations(resumeId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Get an education by id for a resume")
    @GetMapping("/{educationId}")
    public ResponseEntity<EducationResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long educationId) {
        var dto = educationService.getEducation(resumeId, educationId);
        return ResponseEntity.ok(dto);
    }
}