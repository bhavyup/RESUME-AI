package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.service.resume.CredentialService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/credentials")
public class CredentialController {

    private final CredentialService service;

    public CredentialController(CredentialService service) {
        this.service = service;
    }

    @Operation(summary = "List credentials for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<CredentialResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a credential by id")
    @GetMapping("/{credentialId}")
    public ResponseEntity<CredentialResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long credentialId) {
        return ResponseEntity.ok(service.getOne(resumeId, credentialId));
    }

    @Operation(summary = "Create a certification/license")
    @PostMapping
    public ResponseEntity<CredentialResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody CredentialRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/credentials/" + res.id())).body(res);
    }

    @Operation(summary = "Update a certification/license (optimistic locking)")
    @PutMapping("/{credentialId}")
    public ResponseEntity<CredentialResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long credentialId,
            @Valid @RequestBody CredentialUpdateDto dto) {
        var res = service.update(resumeId, credentialId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a certification/license")
    @DeleteMapping("/{credentialId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long credentialId) {
        service.delete(resumeId, credentialId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder credentials")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}