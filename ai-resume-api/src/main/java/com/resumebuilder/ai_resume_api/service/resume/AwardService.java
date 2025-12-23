package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.AwardRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.AwardUpdateDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.enums.AwardType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.AwardRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AwardService {

    private final AwardRepository awardRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public AwardService(AwardRepository awardRepository, ResumeRepository resumeRepository, ResumeMapper resumeMapper) {
        this.awardRepository = awardRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public java.util.List<AwardResponseDto> listAwards(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = awardRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toAwardDtoList(list);
    }

    @Transactional(readOnly = true)
    public AwardResponseDto getAward(Long resumeId, Long awardId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var a = awardRepository.findByIdAndResume_Id(awardId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The award does not belong to the specified resume."));
        return resumeMapper.toDto(a);
    }

    public AwardResponseDto createAward(Long resumeId, AwardRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var a = new AwardEntity();
        a.setResume(resume);

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

        Integer maxOrder = awardRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        a.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        a = awardRepository.save(a);
        return resumeMapper.toDto(a);
    }

    public AwardResponseDto updateAward(Long resumeId, Long awardId, AwardUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var a = awardRepository.findByIdAndResume_Id(awardId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The award does not belong to the specified resume."));

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

    public void deleteAward(Long resumeId, Long awardId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var a = awardRepository.findByIdAndResume_Id(awardId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The award does not belong to the specified resume."));
        awardRepository.delete(a);
    }

    public void reorderAwards(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during awards reorder.");
        }

        var items = awardRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match awards count.");
        }

        var byId = new java.util.HashMap<Long, AwardEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Award not found in this resume: id=" + id);
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