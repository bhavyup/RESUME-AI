package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ResumeRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ResumeResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ResumeSummaryDto;
import com.resumebuilder.ai_resume_api.service.resume.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(name = "Resumes")
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @Operation(summary = "Create a resume")
    @PostMapping
    public ResponseEntity<ResumeResponseDto> createResume(@Valid @RequestBody ResumeRequestDto requestDto) {
        var dto = resumeService.createResume(requestDto);
        return ResponseEntity.created(URI.create("/api/resumes/" + dto.id())).body(dto);
    }

    @Operation(summary = "Update a resume (optimistic locking)")
    @PutMapping("/{resumeId}")
    public ResponseEntity<ResumeResponseDto> updateResume(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto requestDto) {
        var dto = resumeService.updateResume(resumeId, requestDto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "List my resumes (summary)")
    @GetMapping
    public ResponseEntity<List<ResumeSummaryDto>> getResumesForCurrentUser() {
        return ResponseEntity.ok(resumeService.listMyResumes());
    }

    @Operation(summary = "Get my resume by id (full)")
    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponseDto> getResumeById(@PathVariable Long resumeId) {
        return ResponseEntity.ok(resumeService.getMyResume(resumeId));
    }

    @Operation(summary = "Delete my resume")
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(@PathVariable Long resumeId) {
        resumeService.deleteMyResume(resumeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder resume languages")
    @PatchMapping("/{resumeId}/languages/reorder")
    public ResponseEntity<Void> reorderLanguages(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        resumeService.reorderLanguages(resumeId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder resume custom links")
    @PatchMapping("/{resumeId}/links/reorder")
    public ResponseEntity<Void> reorderLinks(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        resumeService.reorderLinks(resumeId, request);
        return ResponseEntity.noContent().build();
    }
}