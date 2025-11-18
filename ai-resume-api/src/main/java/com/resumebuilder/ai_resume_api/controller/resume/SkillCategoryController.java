package com.resumebuilder.ai_resume_api.controller.resume;

import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryResponseDto;
import com.resumebuilder.ai_resume_api.service.resume.SkillCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/resumes/{resumeId}/categories")
public class SkillCategoryController {

    private final SkillCategoryService categoryService;

    public SkillCategoryController(SkillCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Create a skill category")
    @PostMapping
    public ResponseEntity<SkillCategoryResponseDto> createCategory(@PathVariable Long resumeId,
            @Valid @RequestBody SkillCategoryDto categoryDto) {
        var dto = categoryService.createCategory(resumeId, categoryDto);
        return ResponseEntity.created(URI.create("/api/resumes/" + resumeId + "/categories/" + dto.id())).body(dto);
    }

    @Operation(summary = "Update a skill category (optimistic locking)")
    @PutMapping("/{categoryId}")
    public ResponseEntity<SkillCategoryResponseDto> updateCategory(@PathVariable Long resumeId,
            @PathVariable Long categoryId,
            @Valid @RequestBody com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryUpdateDto categoryDto) {
        var dto = categoryService.updateCategory(resumeId, categoryId, categoryDto);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Delete a skill category")
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long resumeId, @PathVariable Long categoryId) {
        categoryService.deleteCategory(resumeId, categoryId);
        return ResponseEntity.noContent().build();
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Reorder categories")
    @org.springframework.web.bind.annotation.PatchMapping("/reorder")
    public org.springframework.http.ResponseEntity<Void> reorderCategories(
            @org.springframework.web.bind.annotation.PathVariable Long resumeId,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.resumebuilder.ai_resume_api.dto.ReorderRequestDto request) {
        categoryService.reorderCategories(resumeId, request);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @Operation(summary = "List skill categories for a resume (ordered)")
    @GetMapping
    public ResponseEntity<java.util.List<SkillCategoryResponseDto>> list(@PathVariable Long resumeId) {
        var list = categoryService.listCategories(resumeId);
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "Get a skill category by id for a resume")
    @GetMapping("/{categoryId}")
    public ResponseEntity<SkillCategoryResponseDto> getOne(@PathVariable Long resumeId, @PathVariable Long categoryId) {
        var dto = categoryService.getCategory(resumeId, categoryId);
        return ResponseEntity.ok(dto);
    }
}