package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoAwardEntity;
import com.resumebuilder.ai_resume_api.enums.AwardType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoAwardRepository;
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
public class ProfileAwardService {

    private final PersonalInfoAwardRepository awardRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileAwardService(PersonalInfoAwardRepository awardRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.awardRepository = awardRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<AwardResponseDto> listAwards() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = awardRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileAwardDtoList(list);
    }

    @Transactional(readOnly = true)
    public AwardResponseDto getAward(Long awardId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var a = awardRepository.findByIdAndPersonalInfo_Id(awardId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This award does not belong to your profile."));
        return resumeMapper.toDto(a);
    }

    public AwardResponseDto createAward(AwardRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        var a = new PersonalInfoAwardEntity();
        a.setPersonalInfo(personalInfo);

        a.setTitle(dto.title());
        a.setIssuer(dto.issuer());
        a.setIssuerUrl(dto.issuerUrl());

        a.setDateReceived(dto.dateReceived());
        a.setDescription(dto.description());

        a.setMonetaryAmountUsd(dto.monetaryAmountUsd());
        a.setCurrencyCode(dto.currencyCode() != null ? dto.currencyCode().toUpperCase() : null);

        a.setAwardType(parseAwardType(dto.awardType()));

        a.setLinkTitle(dto.linkTitle());
        a.setLinkUrl(dto.linkUrl());

        Integer maxOrder = awardRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        a.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        a = awardRepository.save(a);
        return resumeMapper.toDto(a);
    }

    public AwardResponseDto updateAward(Long awardId, AwardUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var a = awardRepository.findByIdAndPersonalInfo_Id(awardId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This award does not belong to your profile."));

        if (dto.version() == null) {
            throw new BadRequestException("Award version is required for update.");
        }
        if (!dto.version().equals(a.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for award id=" + awardId);
        }

        if (dto.title() != null)
            a.setTitle(dto.title());
        if (dto.issuer() != null)
            a.setIssuer(dto.issuer());
        if (dto.issuerUrl() != null)
            a.setIssuerUrl(dto.issuerUrl());
        if (dto.dateReceived() != null)
            a.setDateReceived(dto.dateReceived());
        if (dto.description() != null)
            a.setDescription(dto.description());
        if (dto.monetaryAmountUsd() != null)
            a.setMonetaryAmountUsd(dto.monetaryAmountUsd());
        if (dto.currencyCode() != null)
            a.setCurrencyCode(dto.currencyCode().toUpperCase());
        if (dto.awardType() != null)
            a.setAwardType(parseAwardType(dto.awardType()));
        if (dto.linkTitle() != null)
            a.setLinkTitle(dto.linkTitle());
        if (dto.linkUrl() != null)
            a.setLinkUrl(dto.linkUrl());

        a = awardRepository.save(a);
        return resumeMapper.toDto(a);
    }

    public void deleteAward(Long awardId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var a = awardRepository.findByIdAndPersonalInfo_Id(awardId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This award does not belong to your profile."));
        awardRepository.delete(a);
    }

    public void reorderAwards(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = awardRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match awards count.");
        }

        var byId = new HashMap<Long, PersonalInfoAwardEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Award not found in your profile: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        awardRepository.saveAll(items);
    }

    private AwardType parseAwardType(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace('-', '_');
        try {
            return AwardType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid awardType. Allowed: AWARD, HONOR, SCHOLARSHIP");
        }
    }
}