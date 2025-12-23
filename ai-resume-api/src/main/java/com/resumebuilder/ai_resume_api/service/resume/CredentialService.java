package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.enums.CredentialStatus;
import com.resumebuilder.ai_resume_api.enums.CredentialType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.CredentialRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;

@Service
@Transactional
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public CredentialService(CredentialRepository credentialRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.credentialRepository = credentialRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public java.util.List<CredentialResponseDto> list(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = credentialRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toCredentialDtoList(list);
    }

    @Transactional(readOnly = true)
    public CredentialResponseDto getOne(Long resumeId, Long credentialId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = credentialRepository.findByIdAndResume_Id(credentialId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The credential does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public CredentialResponseDto create(Long resumeId, CredentialRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        validateDates(dto.issueDate(), dto.expiryDate(), Boolean.TRUE.equals(dto.doesNotExpire()));

        var e = new CredentialEntity();
        e.setResume(resume);

        e.setName(dto.name());
        e.setType(parseType(dto.type()));
        e.setIssuer(dto.issuer());
        e.setIssuerUrl(dto.issuerUrl());

        e.setIssueDate(dto.issueDate());
        e.setExpiryDate(dto.expiryDate());
        e.setDoesNotExpire(Boolean.TRUE.equals(dto.doesNotExpire()));

        e.setCredentialId(dto.credentialId());
        e.setCredentialUrl(dto.credentialUrl());

        e.setScore(dto.score());
        e.setScoreUnit(dto.scoreUnit());
        e.setLevel(dto.level());

        // If status not provided, derive from expiry & doesNotExpire
        var status = parseStatus(dto.status());
        if (status == null)
            status = deriveStatus(e.isDoesNotExpire(), e.getExpiryDate());
        e.setStatus(status);

        e.setDescription(dto.description());
        e.setBadgeImageUrl(dto.badgeImageUrl());

        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));

        Integer maxOrder = credentialRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = credentialRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public CredentialResponseDto update(Long resumeId, Long credentialId, CredentialUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = credentialRepository.findByIdAndResume_Id(credentialId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The credential does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Credential version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for credential id=" + credentialId);
        }

        LocalDate newIssue = dto.issueDate() != null ? dto.issueDate() : e.getIssueDate();
        LocalDate newExpiry = dto.expiryDate() != null ? dto.expiryDate() : e.getExpiryDate();
        boolean newNoExp = dto.doesNotExpire() != null ? dto.doesNotExpire() : e.isDoesNotExpire();
        validateDates(newIssue, newExpiry, newNoExp);

        if (dto.name() != null)
            e.setName(dto.name());
        if (dto.type() != null)
            e.setType(parseType(dto.type()));
        if (dto.issuer() != null)
            e.setIssuer(dto.issuer());
        if (dto.issuerUrl() != null)
            e.setIssuerUrl(dto.issuerUrl());

        if (dto.issueDate() != null)
            e.setIssueDate(dto.issueDate());
        if (dto.expiryDate() != null)
            e.setExpiryDate(dto.expiryDate());
        if (dto.doesNotExpire() != null)
            e.setDoesNotExpire(dto.doesNotExpire());

        if (dto.credentialId() != null)
            e.setCredentialId(dto.credentialId());
        if (dto.credentialUrl() != null)
            e.setCredentialUrl(dto.credentialUrl());

        if (dto.score() != null)
            e.setScore(dto.score());
        if (dto.scoreUnit() != null)
            e.setScoreUnit(dto.scoreUnit());
        if (dto.level() != null)
            e.setLevel(dto.level());

        if (dto.status() != null) {
            e.setStatus(parseStatus(dto.status()));
        } else {
            // keep status consistent if dates changed
            e.setStatus(deriveStatus(e.isDoesNotExpire(), e.getExpiryDate()));
        }

        if (dto.description() != null)
            e.setDescription(dto.description());
        if (dto.badgeImageUrl() != null)
            e.setBadgeImageUrl(dto.badgeImageUrl());

        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));

        e = credentialRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long credentialId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = credentialRepository.findByIdAndResume_Id(credentialId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The credential does not belong to the specified resume."));
        credentialRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during credentials reorder.");
        }

        var items = credentialRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match credentials count.");
        }

        var byId = new java.util.HashMap<Long, CredentialEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Credential not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        credentialRepository.saveAll(items);
    }

    private CredentialType parseType(String v) {
        if (v == null || v.isBlank())
            return null;
        var key = v.trim().toUpperCase();
        try {
            return CredentialType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid type. Allowed: CERTIFICATION, LICENSE");
        }
    }

    private CredentialStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        var key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return CredentialStatus.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Allowed: ACTIVE, EXPIRED, REVOKED, SUSPENDED, PENDING");
        }
    }

    private CredentialStatus deriveStatus(boolean doesNotExpire, LocalDate expiry) {
        if (doesNotExpire || expiry == null)
            return CredentialStatus.ACTIVE;
        return expiry.isBefore(LocalDate.now()) ? CredentialStatus.EXPIRED : CredentialStatus.ACTIVE;
    }

    private void validateDates(LocalDate issue, LocalDate expiry, boolean doesNotExpire) {
        if (issue != null && expiry != null && expiry.isBefore(issue)) {
            throw new BadRequestException("expiryDate cannot be before issueDate.");
        }
        if (doesNotExpire && expiry != null) {
            throw new BadRequestException("doesNotExpire is true but expiryDate was provided.");
        }
    }
}