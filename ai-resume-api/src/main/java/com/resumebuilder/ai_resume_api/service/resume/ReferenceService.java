package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.enums.ReferenceContactMethod;
import com.resumebuilder.ai_resume_api.enums.ReferenceRelationship;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ReferenceRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ReferenceService {

    private final ReferenceRepository referenceRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public ReferenceService(ReferenceRepository referenceRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.referenceRepository = referenceRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<ReferenceResponseDto> list(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = referenceRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toReferenceDtoList(list);
    }

    @Transactional(readOnly = true)
    public ReferenceResponseDto getOne(Long resumeId, Long referenceId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = referenceRepository.findByIdAndResume_Id(referenceId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The reference does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public ReferenceResponseDto create(Long resumeId, ReferenceRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var e = new ReferenceEntity();
        e.setResume(resume);

        e.setName(dto.name());
        e.setTitle(dto.title());
        e.setCompany(dto.company());

        e.setRelationship(parseRelationship(dto.relationship()));
        e.setPreferredContactMethod(parseContactMethod(dto.preferredContactMethod()));

        e.setEmail(dto.email());
        e.setPhone(dto.phone());
        e.setLinkedinUrl(dto.linkedinUrl());
        e.setWebsiteUrl(dto.websiteUrl());

        e.setConsentToShare(Boolean.TRUE.equals(dto.consentToShare()));
        e.setVisible(Boolean.TRUE.equals(dto.visible()));

        e.setRelationshipNote(dto.relationshipNote());
        e.setNote(dto.note());
        e.setLastVerifiedOn(dto.lastVerifiedOn());

        validateVisibilityConsent(e.isVisible(), e.isConsentToShare(), e.getEmail(), e.getPhone(), e.getLinkedinUrl(),
                e.getWebsiteUrl());

        Integer maxOrder = referenceRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = referenceRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public ReferenceResponseDto update(Long resumeId, Long referenceId, ReferenceUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = referenceRepository.findByIdAndResume_Id(referenceId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The reference does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Reference version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for reference id=" + referenceId);
        }

        if (dto.name() != null)
            e.setName(dto.name());
        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.company() != null)
            e.setCompany(dto.company());

        if (dto.relationship() != null)
            e.setRelationship(parseRelationship(dto.relationship()));
        if (dto.preferredContactMethod() != null)
            e.setPreferredContactMethod(parseContactMethod(dto.preferredContactMethod()));

        if (dto.email() != null)
            e.setEmail(dto.email());
        if (dto.phone() != null)
            e.setPhone(dto.phone());
        if (dto.linkedinUrl() != null)
            e.setLinkedinUrl(dto.linkedinUrl());
        if (dto.websiteUrl() != null)
            e.setWebsiteUrl(dto.websiteUrl());

        if (dto.consentToShare() != null)
            e.setConsentToShare(dto.consentToShare());
        if (dto.visible() != null)
            e.setVisible(dto.visible());

        if (dto.relationshipNote() != null)
            e.setRelationshipNote(dto.relationshipNote());
        if (dto.note() != null)
            e.setNote(dto.note());
        if (dto.lastVerifiedOn() != null)
            e.setLastVerifiedOn(dto.lastVerifiedOn());

        validateVisibilityConsent(e.isVisible(), e.isConsentToShare(), e.getEmail(), e.getPhone(), e.getLinkedinUrl(),
                e.getWebsiteUrl());

        e = referenceRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long referenceId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = referenceRepository.findByIdAndResume_Id(referenceId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The reference does not belong to the specified resume."));
        referenceRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during references reorder.");
        }

        var items = referenceRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match references count.");
        }

        var byId = new HashMap<Long, ReferenceEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Reference not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        referenceRepository.saveAll(items);
    }

    // Settings: "References available on request"
    @Transactional(readOnly = true)
    public ReferencesSettingsDto getSettings(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        return new ReferencesSettingsDto(resume.getVersion(), resume.isReferencesOnRequest());
    }

    public void updateSettings(Long resumeId, ReferencesSettingsDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        if (!resume.getVersion().equals(dto.resumeVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume while updating references settings.");
        }
        resume.setReferencesOnRequest(Boolean.TRUE.equals(dto.referencesOnRequest()));
        // JPA dirty checking will persist
    }

    // ------------------------ Helpers ------------------------

    private void validateVisibilityConsent(boolean visible, boolean consent, String email, String phone,
            String linkedin, String website) {
        boolean hasContact = (email != null && !email.isBlank())
                || (phone != null && !phone.isBlank())
                || (linkedin != null && !linkedin.isBlank())
                || (website != null && !website.isBlank());
        if (visible && hasContact && !consent) {
            throw new BadRequestException("visible=true with contact info requires consentToShare=true.");
        }
    }

    private ReferenceRelationship parseRelationship(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return ReferenceRelationship.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid relationship. Allowed: MANAGER, SUPERVISOR, PEER, COLLEAGUE, DIRECT_REPORT, CLIENT, STAKEHOLDER, PROFESSOR, TEACHER, MENTOR, ADVISOR, COACH, OTHER");
        }
    }

    private ReferenceContactMethod parseContactMethod(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return ReferenceContactMethod.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid preferredContactMethod. Allowed: EMAIL, PHONE, LINKEDIN, WEBSITE, OTHER");
        }
    }
}