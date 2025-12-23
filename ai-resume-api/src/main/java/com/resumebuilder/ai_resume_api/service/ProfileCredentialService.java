package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CredentialRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CredentialResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.CredentialUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoCredentialEntity;
import com.resumebuilder.ai_resume_api.enums.CredentialStatus;
import com.resumebuilder.ai_resume_api.enums.CredentialType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoCredentialRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class ProfileCredentialService {

    private final PersonalInfoCredentialRepository credentialRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileCredentialService(PersonalInfoCredentialRepository credentialRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<CredentialResponseDto> list() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = credentialRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileCredentialDtoList(list);
    }

    @Transactional(readOnly = true)
    public CredentialResponseDto getOne(Long credentialId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = credentialRepository.findByIdAndPersonalInfo_Id(credentialId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This credential does not belong to your profile."));
        return resumeMapper.toDto(e);
    }

    public CredentialResponseDto create(CredentialRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        validateDates(dto.issueDate(), dto.expiryDate(), Boolean.TRUE.equals(dto.doesNotExpire()));

        var e = new PersonalInfoCredentialEntity();
        e.setPersonalInfo(personalInfo);

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

        var status = parseStatus(dto.status());
        if (status == null)
            status = deriveStatus(e.isDoesNotExpire(), e.getExpiryDate());
        e.setStatus(status);

        e.setDescription(dto.description());
        e.setBadgeImageUrl(dto.badgeImageUrl());

        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));

        Integer maxOrder = credentialRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = credentialRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public CredentialResponseDto update(Long credentialId, CredentialUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = credentialRepository.findByIdAndPersonalInfo_Id(credentialId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This credential does not belong to your profile."));

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

    public void delete(Long credentialId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = credentialRepository.findByIdAndPersonalInfo_Id(credentialId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This credential does not belong to your profile."));
        credentialRepository.delete(e);
    }

    public void reorder(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = credentialRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match credentials count.");
        }

        var byId = new HashMap<Long, PersonalInfoCredentialEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Credential not found in your profile: id=" + id);
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