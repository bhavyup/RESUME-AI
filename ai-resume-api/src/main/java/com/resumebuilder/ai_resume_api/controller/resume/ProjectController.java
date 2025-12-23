package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ProjectRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectUpdateDto;
import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.service.resume.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/resumes/{resumeId}/projects")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @Operation(summary = "Create a project")
    @PostMapping
    public ResponseEntity<ProjectResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody ProjectRequestDto dto) {
        var res = service.createProject(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/projects/" + res.id())).body(res);
    }

    @Operation(summary = "Update a project (optimistic locking)")
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectUpdateDto dto) {
        var res = service.updateProject(resumeId, projectId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a project")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long projectId) {
        service.deleteProject(resumeId, projectId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder projects")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorderProjects(resumeId, req);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List projects for a resume (ordered)")
    @GetMapping
    public ResponseEntity<java.util.List<ProjectResponseDto>> list(
            @PathVariable Long resumeId) {
        var list = service.listProjects(resumeId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Get a project by id for a resume")
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponseDto> getOne(
            @PathVariable Long resumeId,
            @PathVariable Long projectId) {
        var dto = service.getProject(resumeId, projectId);
        return ResponseEntity.ok(dto);
    }
}