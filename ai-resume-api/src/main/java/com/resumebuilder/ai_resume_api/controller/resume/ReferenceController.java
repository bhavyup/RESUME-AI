package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.service.resume.ReferenceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/references")
public class ReferenceController {

    private final ReferenceService service;

    public ReferenceController(ReferenceService service) {
        this.service = service;
    }

    @Operation(summary = "List references for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<ReferenceResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a reference by id")
    @GetMapping("/{referenceId}")
    public ResponseEntity<ReferenceResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long referenceId) {
        return ResponseEntity.ok(service.getOne(resumeId, referenceId));
    }

    @Operation(summary = "Create a reference")
    @PostMapping
    public ResponseEntity<ReferenceResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody ReferenceRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/references/" + res.id())).body(res);
    }

    @Operation(summary = "Update a reference (optimistic locking)")
    @PutMapping("/{referenceId}")
    public ResponseEntity<ReferenceResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long referenceId,
            @Valid @RequestBody ReferenceUpdateDto dto) {
        var res = service.update(resumeId, referenceId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a reference")
    @DeleteMapping("/{referenceId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long referenceId) {
        service.delete(resumeId, referenceId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder references")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }

    // Settings: "References available on request"
    @Operation(summary = "Get reference settings (resume-level)")
    @GetMapping("/settings")
    public ResponseEntity<ReferencesSettingsDto> getSettings(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.getSettings(resumeId));
    }

    @Operation(summary = "Update reference settings (resume-level, optimistic locking)")
    @PatchMapping("/settings")
    public ResponseEntity<Void> updateSettings(@PathVariable Long resumeId,
            @Valid @RequestBody ReferencesSettingsDto dto) {
        service.updateSettings(resumeId, dto);
        return ResponseEntity.noContent().build();
    }
}