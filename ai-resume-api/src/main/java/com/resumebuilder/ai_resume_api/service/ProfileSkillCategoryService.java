package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillCategoryUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoSkillCategoryEntity;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoSkillCategoryRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class ProfileSkillCategoryService {

    private final PersonalInfoSkillCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileSkillCategoryService(PersonalInfoSkillCategoryRepository categoryRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    public SkillCategoryResponseDto createCategory(SkillCategoryDto categoryDto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        if (categoryRepository.existsByPersonalInfo_IdAndNameIgnoreCase(personalInfo.getId(), categoryDto.name())) {
            throw new IllegalArgumentException("Category with this name already exists in your profile");
        }

        var c = new PersonalInfoSkillCategoryEntity();
        c.setName(categoryDto.name());
        c.setPredefined(false);
        c.setPersonalInfo(personalInfo);

        Integer maxOrder = categoryRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        c.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        c = categoryRepository.save(c);
        return resumeMapper.toDto(c);
    }

    public SkillCategoryResponseDto updateCategory(Long categoryId, SkillCategoryUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var c = categoryRepository.findByIdAndPersonalInfo_Id(categoryId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This category does not belong to your profile."));

        if (dto.version() == null) {
            throw new BadRequestException("Category version is required for update.");
        }
        if (!dto.version().equals(c.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for category id=" + categoryId);
        }

        if (dto.name() != null && !c.getName().equalsIgnoreCase(dto.name())
                && categoryRepository.existsByPersonalInfo_IdAndNameIgnoreCase(personalInfo.getId(), dto.name())) {
            throw new BadRequestException("Category with this name already exists in your profile");
        }

        c.setName(dto.name());
        c = categoryRepository.save(c);
        return resumeMapper.toDto(c);
    }

    public void deleteCategory(Long categoryId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var c = categoryRepository.findByIdAndPersonalInfo_Id(categoryId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This category does not belong to your profile."));
        categoryRepository.delete(c);
    }

    public void reorderCategories(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = categoryRepository.findAllByPersonalInfo_Id(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match categories count.");
        }

        var byId = new HashMap<Long, PersonalInfoSkillCategoryEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Category not found in your profile: id=" + id);
            }
            if (!seen.add(id)) {
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        categoryRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public SkillCategoryResponseDto getCategory(Long categoryId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var c = categoryRepository.findByIdAndPersonalInfo_Id(categoryId, personalInfo.getId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        return resumeMapper.toDto(c);
    }

    @Transactional(readOnly = true)
    public List<SkillCategoryResponseDto> listCategories() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = categoryRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileCategoryDtoList(list);
    }
}