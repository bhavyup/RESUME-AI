package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.SkillRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillResponseDto;
import com.resumebuilder.ai_resume_api.service.resume.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/resumes/{resumeId}/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @Operation(summary = "Create a skill")
    @PostMapping
    public ResponseEntity<SkillResponseDto> createSkill(@PathVariable Long resumeId,
            @Valid @RequestBody SkillRequestDto skillDto) {
        var dto = skillService.createSkill(resumeId, skillDto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/skills/" + dto.id())).body(dto);
    }

    @Operation(summary = "Update a skill (optimistic locking)")
    @PutMapping("/{skillId}")
    public ResponseEntity<SkillResponseDto> updateSkill(@PathVariable Long resumeId,
            @PathVariable Long skillId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.resume.SkillUpdateDto skillDto) {
        var dto = skillService.updateSkill(resumeId, skillId, skillDto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Delete a skill")
    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long resumeId, @PathVariable Long skillId) {
        skillService.deleteSkill(resumeId, skillId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder skills")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderSkills(@PathVariable Long resumeId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        skillService.reorderSkills(resumeId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List skills for a resume (ordered)")
    @GetMapping
    public ResponseEntity<java.util.List<SkillResponseDto>> list(@PathVariable Long resumeId) {
        var list = skillService.listSkills(resumeId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Get a skill by id for a resume")
    @GetMapping("/{skillId}")
    public ResponseEntity<SkillResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long skillId) {
        var dto = skillService.getSkill(resumeId, skillId);
        return ResponseEntity.ok(dto);
    }
}