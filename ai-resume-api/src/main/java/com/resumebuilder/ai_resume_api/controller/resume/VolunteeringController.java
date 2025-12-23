package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.VolunteeringRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.VolunteeringResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.VolunteeringUpdateDto;
import com.resumebuilder.ai_resume_api.service.resume.VolunteeringService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/volunteering")
public class VolunteeringController {

    private final VolunteeringService service;

    public VolunteeringController(VolunteeringService service) {
        this.service = service;
    }

    @Operation(summary = "List volunteering entries for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<VolunteeringResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a volunteering entry by id")
    @GetMapping("/{volunteeringId}")
    public ResponseEntity<VolunteeringResponseDto> getOne(@PathVariable Long resumeId,
            @PathVariable Long volunteeringId) {
        return ResponseEntity.ok(service.getOne(resumeId, volunteeringId));
    }

    @Operation(summary = "Create a volunteering/leadership/community entry")
    @PostMapping
    public ResponseEntity<VolunteeringResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody VolunteeringRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/volunteering/" + res.id())).body(res);
    }

    @Operation(summary = "Update a volunteering entry (optimistic locking)")
    @PutMapping("/{volunteeringId}")
    public ResponseEntity<VolunteeringResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long volunteeringId,
            @Valid @RequestBody VolunteeringUpdateDto dto) {
        var res = service.update(resumeId, volunteeringId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a volunteering entry")
    @DeleteMapping("/{volunteeringId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long volunteeringId) {
        service.delete(resumeId, volunteeringId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder volunteering entries")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}