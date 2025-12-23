package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.TalkRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.TalkResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.TalkUpdateDto;
import com.resumebuilder.ai_resume_api.service.resume.TalkService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/talks")
public class TalkController {

    private final TalkService service;

    public TalkController(TalkService service) {
        this.service = service;
    }

    @Operation(summary = "List talks for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<TalkResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a talk by id")
    @GetMapping("/{talkId}")
    public ResponseEntity<TalkResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long talkId) {
        return ResponseEntity.ok(service.getOne(resumeId, talkId));
    }

    @Operation(summary = "Create a talk/speaking engagement")
    @PostMapping
    public ResponseEntity<TalkResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody TalkRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/talks/" + res.id())).body(res);
    }

    @Operation(summary = "Update a talk (optimistic locking)")
    @PutMapping("/{talkId}")
    public ResponseEntity<TalkResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long talkId,
            @Valid @RequestBody TalkUpdateDto dto) {
        var res = service.update(resumeId, talkId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a talk")
    @DeleteMapping("/{talkId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long talkId) {
        service.delete(resumeId, talkId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder talks")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}