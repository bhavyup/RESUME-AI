package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardUpdateDto;
import com.resumebuilder.ai_resume_api.service.resume.AwardService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/awards")
public class AwardController {

    private final AwardService service;

    public AwardController(AwardService service) {
        this.service = service;
    }

    @Operation(summary = "List awards for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<AwardResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.listAwards(resumeId));
    }

    @Operation(summary = "Get a single award by id")
    @GetMapping("/{awardId}")
    public ResponseEntity<AwardResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long awardId) {
        return ResponseEntity.ok(service.getAward(resumeId, awardId));
    }

    @Operation(summary = "Create an award")
    @PostMapping
    public ResponseEntity<AwardResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody AwardRequestDto dto) {
        var res = service.createAward(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/awards/" + res.id())).body(res);
    }

    @Operation(summary = "Update an award (optimistic locking)")
    @PutMapping("/{awardId}")
    public ResponseEntity<AwardResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long awardId,
            @Valid @RequestBody AwardUpdateDto dto) {
        var res = service.updateAward(resumeId, awardId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete an award")
    @DeleteMapping("/{awardId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long awardId) {
        service.deleteAward(resumeId, awardId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder awards")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId, @Valid @RequestBody ReorderRequestDto req) {
        service.reorderAwards(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}