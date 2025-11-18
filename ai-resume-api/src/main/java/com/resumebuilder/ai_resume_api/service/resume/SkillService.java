package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.SkillRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.SkillResponseDto;
import com.resumebuilder.ai_resume_api.entity.resume.CertificationEntity;
import com.resumebuilder.ai_resume_api.entity.resume.SkillEntity;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.repository.resume.SkillCategoryRepository;
import com.resumebuilder.ai_resume_api.repository.resume.SkillRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;
    private final ResumeRepository resumeRepository;
    private final SkillCategoryRepository categoryRepository;
    private final ResumeMapper resumeMapper;

    public SkillService(SkillRepository skillRepository,
            ResumeRepository resumeRepository,
            SkillCategoryRepository categoryRepository,
            ResumeMapper resumeMapper) {
        this.skillRepository = skillRepository;
        this.resumeRepository = resumeRepository;
        this.categoryRepository = categoryRepository;
        this.resumeMapper = resumeMapper;
    }

    public SkillResponseDto createSkill(Long resumeId, SkillRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var s = new SkillEntity();
        s.setName(dto.name());
        s.setYearsOfExperience(dto.yearsOfExperience());
        s.setLastUsed(dto.lastUsed());
        s.setPrimary(Boolean.TRUE.equals(dto.primary()));

        // proficiency: honor resume.skillProficiencyType
        var type = resume.getSkillProficiencyType(); // Enum NUMERIC/STRING
        if (type == com.resumebuilder.ai_resume_api.enums.SkillProficiencyType.NUMERIC) {
            if (dto.proficiencyLevel() == null) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "proficiencyLevel is required when resume.skillProficiencyType=NUMERIC");
            }
            s.setProficiencyLevel(dto.proficiencyLevel());
            // keep name optional if provided
            s.setProficiencyName(parseSkillLevel(dto.proficiencyName()));
        } else { // STRING
            var lvl = parseSkillLevel(dto.proficiencyName());
            if (lvl == null) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "proficiencyName is required when resume.skillProficiencyType=STRING");
            }
            s.setProficiencyName(lvl);
            // keep numeric optional if provided
            s.setProficiencyLevel(dto.proficiencyLevel() == null ? 0 : dto.proficiencyLevel());
        }

        if (dto.keywords() != null) {
            s.setKeywords(new java.util.ArrayList<>(dto.keywords()));
        }

        s.setResume(resume);

        if (dto.categoryId() != null) {
            var cat = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            if (!Objects.equals(cat.getResume().getId(), resumeId)) {
                throw new AccessDeniedException("This category does not belong to the specified resume.");
            }
            s.setCategory(cat);
        }

        if (dto.certifications() != null) {
            List<CertificationEntity> certs = new ArrayList<>();
            for (var c : dto.certifications()) {
                var ce = new CertificationEntity();
                ce.setName(c.name());
                ce.setUrl(c.url());
                ce.setDocumentUrl(c.documentUrl());
                ce.setSkill(s);
                certs.add(ce);
            }
            s.setCertifications(certs);
        }

        Integer maxOrder = skillRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        s.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        s = skillRepository.save(s);
        return resumeMapper.toDto(s);
    }

    public SkillResponseDto updateSkill(Long resumeId, Long skillId,
            com.resumebuilder.ai_resume_api.dto.resume.SkillUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var s = skillRepository.findByIdAndResume_Id(skillId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to the specified resume."));

        if (dto.version() == null) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Skill version is required for update.");
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

        // proficiency updates: accept either/both; do not hard error if resume type
        // differs
        if (dto.proficiencyLevel() != null)
            s.setProficiencyLevel(dto.proficiencyLevel());
        if (dto.proficiencyName() != null)
            s.setProficiencyName(parseSkillLevel(dto.proficiencyName()));

        if (dto.keywords() != null)
            s.setKeywords(new java.util.ArrayList<>(dto.keywords()));

        if (dto.categoryId() != null) {
            var cat = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            if (!Objects.equals(cat.getResume().getId(), resumeId)) {
                throw new AccessDeniedException("Cannot assign skill to a category from a different resume.");
            }
            s.setCategory(cat);
        } else if (dto.categoryId() == null) {
            s.setCategory(null);
        }

        // Nested certifications with optimistic locking (unchanged)
        if (dto.certifications() != null) {
            if (s.getCertifications() == null)
                s.setCertifications(new ArrayList<>());

            Map<Long, CertificationEntity> existingById = new HashMap<>();
            for (var c : s.getCertifications())
                if (c.getId() != null)
                    existingById.put(c.getId(), c);

            Map<Long, com.resumebuilder.ai_resume_api.dto.resume.SkillUpdateDto.CertificationUpdateDto> dtoById = new HashMap<>();
            dto.certifications().stream().filter(c -> c.id() != null).forEach(c -> dtoById.put(c.id(), c));

            s.getCertifications().removeIf(c -> c.getId() != null && !dtoById.containsKey(c.getId()));

            for (var c : dto.certifications()) {
                if (c.id() != null) {
                    var existing = existingById.get(c.id());
                    if (existing == null)
                        throw new NotFoundException("Certification not found on this skill: id=" + c.id());
                    if (c.version() == null) {
                        throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
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
                    var ce = new CertificationEntity();
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

    public void deleteSkill(Long resumeId, Long skillId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var s = skillRepository.findByIdAndResume_Id(skillId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to the specified resume."));
        skillRepository.delete(s);
    }

    public void reorderSkills(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during skill reorder.");
        }

        var items = skillRepository.findAllByResume_Id(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match skills count.");
        }

        var byId = new java.util.HashMap<Long, SkillEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Skill not found in this resume: id = " + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        skillRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public SkillResponseDto getSkill(Long resumeId, Long skillId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var s = skillRepository.findByIdAndResume_Id(skillId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("This skill does not belong to the specified resume."));
        return resumeMapper.toDto(s);
    }

    @Transactional(readOnly = true)
    public java.util.List<SkillResponseDto> listSkills(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var list = skillRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toSkillDtoList(list);
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
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Invalid proficiencyName. Allowed: NOVICE, INTERMEDIATE, ADVANCED, EXPERT");
        }
    }
}