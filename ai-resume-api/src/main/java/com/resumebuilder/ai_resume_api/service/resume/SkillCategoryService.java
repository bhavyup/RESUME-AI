package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryResponseDto;
import com.resumebuilder.ai_resume_api.entity.resume.SkillCategoryEntity;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.repository.resume.SkillCategoryRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SkillCategoryService {

    private final SkillCategoryRepository categoryRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public SkillCategoryService(SkillCategoryRepository categoryRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.categoryRepository = categoryRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    public SkillCategoryResponseDto createCategory(Long resumeId, SkillCategoryDto categoryDto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (categoryRepository.existsByResume_IdAndNameIgnoreCase(resume.getId(), categoryDto.name())) {
            throw new IllegalArgumentException("Category with this name already exists in this resume");
        }

        var c = new SkillCategoryEntity();
        c.setName(categoryDto.name());
        c.setPredefined(false);
        c.setResume(resume);

        Integer maxOrder = categoryRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        c.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        c = categoryRepository.save(c);
        return resumeMapper.toDto(c);
    }

    public SkillCategoryResponseDto updateCategory(Long resumeId, Long categoryId,
            com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var c = categoryRepository.findByIdAndResume_Id(categoryId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("This category does not belong to the specified resume."));

        if (dto.version() == null) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Category version is required for update.");
        }
        if (!dto.version().equals(c.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for category id=" + categoryId);
        }

        if (dto.name() != null && !c.getName().equalsIgnoreCase(dto.name())
                && categoryRepository.existsByResume_IdAndNameIgnoreCase(resume.getId(), dto.name())) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Category with this name already exists in this resume");
        }

        c.setName(dto.name());
        c = categoryRepository.save(c);
        return resumeMapper.toDto(c);
    }

    public void deleteCategory(Long resumeId, Long categoryId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var c = categoryRepository.findByIdAndResume_Id(categoryId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("This category does not belong to the specified resume."));
        categoryRepository.delete(c);
    }

    public void reorderCategories(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during category reorder.");
        }

        var items = categoryRepository.findAllByResume_Id(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match categories count.");
        }

        var byId = new java.util.HashMap<Long, SkillCategoryEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Category not found in this resume: id=" + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        categoryRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public SkillCategoryResponseDto getCategory(Long resumeId, Long categoryId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var c = categoryRepository.findByIdAndResume_Id(categoryId, resume.getId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        return resumeMapper.toDto(c);
    }

    @Transactional(readOnly = true)
    public java.util.List<SkillCategoryResponseDto> listCategories(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var list = categoryRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toCategoryDtoList(list);
    }
}