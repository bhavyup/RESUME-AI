package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoCertificationEntity;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoSkillEntity;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoSkillCategoryRepository;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoSkillRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ProfileSkillService {

    private final PersonalInfoSkillRepository skillRepository;
    private final UserRepository userRepository;
    private final PersonalInfoSkillCategoryRepository categoryRepository;
    private final ResumeMapper resumeMapper;

    public ProfileSkillService(PersonalInfoSkillRepository skillRepository,
            UserRepository userRepository,
            PersonalInfoSkillCategoryRepository categoryRepository,
            ResumeMapper resumeMapper) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.resumeMapper = resumeMapper;
    }

    public SkillResponseDto createSkill(SkillRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        var s = new PersonalInfoSkillEntity();
        s.setName(dto.name());
        s.setYearsOfExperience(dto.yearsOfExperience());
        s.setLastUsed(dto.lastUsed());
        s.setPrimary(Boolean.TRUE.equals(dto.primary()));

        // Default proficiency handling (no resume-level setting for profile)
        if (dto.proficiencyLevel() != null) {
            s.setProficiencyLevel(dto.proficiencyLevel());
        } else {
            s.setProficiencyLevel(0);
        }
        s.setProficiencyName(parseSkillLevel(dto.proficiencyName()));

        if (dto.keywords() != null) {
            s.setKeywords(new java.util.ArrayList<>(dto.keywords()));
        }

        s.setPersonalInfo(personalInfo);

        if (dto.categoryId() != null) {
            var cat = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            if (!Objects.equals(cat.getPersonalInfo().getId(), personalInfo.getId())) {
                throw new AccessDeniedException("This category does not belong to your profile.");
            }
            s.setCategory(cat);
        }

        if (dto.certifications() != null) {
            List<PersonalInfoCertificationEntity> certs = new ArrayList<>();
            for (var c : dto.certifications()) {
                var ce = new PersonalInfoCertificationEntity();
                ce.setName(c.name());
                ce.setUrl(c.url());
                ce.setDocumentUrl(c.documentUrl());
                ce.setSkill(s);
                certs.add(ce);
            }
            s.setCertifications(certs);
        }

        Integer maxOrder = skillRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        s.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        s = skillRepository.save(s);
        return resumeMapper.toDto(s);
    }

    public SkillResponseDto updateSkill(Long skillId, SkillUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var s = skillRepository.findByIdAndPersonalInfo_Id(skillId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to your profile."));

        if (dto.version() == null) {
            throw new BadRequestException("Skill version is required for update.");
        }
        if (!dto.version().equals(s.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for skill id=" + skillId);
        }

        if (dto.name() != null)
            s.setName(dto.name());
        if (dto.yearsOfExperience() != null)
            s.setYearsOfExperience(dto.yearsOfExperience());
        if (dto.lastUsed() != null)
            s.setLastUsed(dto.lastUsed());
        if (dto.primary() != null)
            s.setPrimary(dto.primary());

        if (dto.proficiencyLevel() != null)
            s.setProficiencyLevel(dto.proficiencyLevel());
        if (dto.proficiencyName() != null)
            s.setProficiencyName(parseSkillLevel(dto.proficiencyName()));

        if (dto.keywords() != null)
            s.setKeywords(new java.util.ArrayList<>(dto.keywords()));

        if (dto.categoryId() != null) {
            var cat = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            if (!Objects.equals(cat.getPersonalInfo().getId(), personalInfo.getId())) {
                throw new AccessDeniedException("Cannot assign skill to a category from a different profile.");
            }
            s.setCategory(cat);
        } else if (dto.categoryId() == null) {
            s.setCategory(null);
        }

        // Nested certifications with optimistic locking
        if (dto.certifications() != null) {
            if (s.getCertifications() == null)
                s.setCertifications(new ArrayList<>());

            Map<Long, PersonalInfoCertificationEntity> existingById = new HashMap<>();
            for (var c : s.getCertifications())
                if (c.getId() != null)
                    existingById.put(c.getId(), c);

            Map<Long, SkillUpdateDto.CertificationUpdateDto> dtoById = new HashMap<>();
            dto.certifications().stream().filter(c -> c.id() != null).forEach(c -> dtoById.put(c.id(), c));

            s.getCertifications().removeIf(c -> c.getId() != null && !dtoById.containsKey(c.getId()));

            for (var c : dto.certifications()) {
                if (c.id() != null) {
                    var existing = existingById.get(c.id());
                    if (existing == null)
                        throw new NotFoundException("Certification not found on this skill: id=" + c.id());
                    if (c.version() == null) {
                        throw new BadRequestException(
                                "Certification version is required for update (id=" + c.id() + ").");
                    }
                    if (!c.version().equals(existing.getVersion())) {
                        throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                                "Version mismatch for certification id=" + c.id());
                    }
                    existing.setName(c.name());
                    existing.setUrl(c.url());
                    existing.setDocumentUrl(c.documentUrl());
                } else {
                    var ce = new PersonalInfoCertificationEntity();
                    ce.setName(c.name());
                    ce.setUrl(c.url());
                    ce.setDocumentUrl(c.documentUrl());
                    ce.setSkill(s);
                    s.getCertifications().add(ce);
                }
            }
        }

        s = skillRepository.save(s);
        return resumeMapper.toDto(s);
    }

    public void deleteSkill(Long skillId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var s = skillRepository.findByIdAndPersonalInfo_Id(skillId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to your profile."));
        skillRepository.delete(s);
    }

    public void reorderSkills(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = skillRepository.findAllByPersonalInfo_Id(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match skills count.");
        }

        var byId = new HashMap<Long, PersonalInfoSkillEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Skill not found in your profile: id = " + id);
            }
            if (!seen.add(id)) {
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        skillRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public SkillResponseDto getSkill(Long skillId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var s = skillRepository.findByIdAndPersonalInfo_Id(skillId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to your profile."));
        return resumeMapper.toDto(s);
    }

    @Transactional(readOnly = true)
    public List<SkillResponseDto> listSkills() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = skillRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileSkillDtoList(list);
    }

    private com.resumebuilder.ai_resume_api.enums.SkillLevel parseSkillLevel(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        if (key.equals("BEGINNER"))
            key = "NOVICE";
        try {
            return com.resumebuilder.ai_resume_api.enums.SkillLevel.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid proficiencyName. Allowed: NOVICE, INTERMEDIATE, ADVANCED, EXPERT");
        }
    }
}