package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.service.resume.PatentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/patents")
public class PatentController {

    private final PatentService service;

    public PatentController(PatentService service) {
        this.service = service;
    }

    @Operation(summary = "List patents for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<PatentResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a patent by id")
    @GetMapping("/{patentId}")
    public ResponseEntity<PatentResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long patentId) {
        return ResponseEntity.ok(service.getOne(resumeId, patentId));
    }

    @Operation(summary = "Create a patent")
    @PostMapping
    public ResponseEntity<PatentResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody PatentRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/patents/" + res.id())).body(res);
    }

    @Operation(summary = "Update a patent (optimistic locking)")
    @PutMapping("/{patentId}")
    public ResponseEntity<PatentResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long patentId,
            @Valid @RequestBody PatentUpdateDto dto) {
        var res = service.update(resumeId, patentId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a patent")
    @DeleteMapping("/{patentId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long patentId) {
        service.delete(resumeId, patentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder patents")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId, @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}