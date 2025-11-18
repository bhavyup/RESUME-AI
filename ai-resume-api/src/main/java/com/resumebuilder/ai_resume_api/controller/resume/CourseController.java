package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseUpdateDto;
import com.resumebuilder.ai_resume_api.service.resume.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/courses")
public class CourseController {

    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    @Operation(summary = "List courses for a resume (ordered)")
    @GetMapping
    public ResponseEntity<List<CourseResponseDto>> list(@PathVariable Long resumeId) {
        return ResponseEntity.ok(service.list(resumeId));
    }

    @Operation(summary = "Get a course by id")
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long courseId) {
        return ResponseEntity.ok(service.getOne(resumeId, courseId));
    }

    @Operation(summary = "Create a course/online learning")
    @PostMapping
    public ResponseEntity<CourseResponseDto> create(@PathVariable Long resumeId,
            @Valid @RequestBody CourseRequestDto dto) {
        var res = service.create(resumeId, dto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/courses/" + res.id())).body(res);
    }

    @Operation(summary = "Update a course (optimistic locking)")
    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponseDto> update(@PathVariable Long resumeId,
            @PathVariable Long courseId,
            @Valid @RequestBody CourseUpdateDto dto) {
        var res = service.update(resumeId, courseId, dto);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Delete a course")
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId, @PathVariable Long courseId) {
        service.delete(resumeId, courseId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reorder courses")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long resumeId,
            @Valid @RequestBody ReorderRequestDto req) {
        service.reorder(resumeId, req);
        return ResponseEntity.noContent().build();
    }
}   