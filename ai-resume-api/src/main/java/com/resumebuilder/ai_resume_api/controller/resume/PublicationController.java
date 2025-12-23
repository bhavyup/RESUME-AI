package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationUpdateDto;
import com.resumebuilder.ai_resume_api.service.resume.PublicationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/publications")
public class PublicationController {

    private final PublicationService service;

    public PublicationController(PublicationService service) {
        this.service = service;
    }

    @Operation(summary = "List publications for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<PublicationResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a publication by id")
    @GetMapping("/{publicationId}")
    public ResponseEntity<PublicationResponseDto> getOne(@PathVariable Long resumeId,
            @PathVariable Long publicationId) {
        return ResponseEntity.ok(service.getOne(resumeId, publicationId));
    }

    @Operation(summary = "Create a publication")
    @PostMapping
    public ResponseEntity<PublicationResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody PublicationRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/publications/" + res.id())).body(res);
    }

    @Operation(summary = "Update a publication (optimistic locking)")
    @PutMapping("/{publicationId}")
    public ResponseEntity<PublicationResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long publicationId,
            @Valid @RequestBody PublicationUpdateDto dto) {
        var res = service.update(resumeId, publicationId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a publication")
    @DeleteMapping("/{publicationId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long publicationId) {
        service.delete(resumeId, publicationId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder publications")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}