package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.entity.embedded.PatentLink;
import com.resumebuilder.ai_resume_api.enums.PatentLinkType;
import com.resumebuilder.ai_resume_api.enums.PatentOffice;
import com.resumebuilder.ai_resume_api.enums.PatentStatus;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.PatentRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

@Service
@Transactional
public class PatentService {

    private final PatentRepository patentRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public PatentService(PatentRepository patentRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.patentRepository = patentRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public java.util.List<PatentResponseDto> list(Long resumeId) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = patentRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toPatentDtoList(list);
    }

    @Transactional(readOnly = true)
    public PatentResponseDto getOne(Long resumeId, Long patentId) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = patentRepository.findByIdAndResume_Id(patentId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The patent does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public PatentResponseDto create(Long resumeId, PatentRequestDto dto) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var e = new PatentEntity();
        e.setResume(resume);

        e.setTitle(dto.title());
        e.setPatentNumber(dto.patentNumber());
        e.setApplicationNumber(dto.applicationNumber());
        e.setPriorityNumber(dto.priorityNumber());
        e.setPctNumber(dto.pctNumber());

        e.setFilingDate(dto.filingDate());
        e.setGrantDate(dto.grantDate());
        e.setPublicationDate(dto.publicationDate());

        e.setStatus(parseStatus(dto.status()));
        e.setOffice(parseOffice(dto.office()));
        e.setJurisdictionCountry(dto.jurisdictionCountry() != null ? dto.jurisdictionCountry().toUpperCase() : null);

        e.setKindCode(dto.kindCode());
        e.setFamilyId(dto.familyId());

        e.setShortDescription(dto.shortDescription());
        e.setClaimsSummary(dto.claimsSummary());
        e.setOfficialUrl(dto.officialUrl());

        if (dto.inventors() != null)
            e.setInventors(new ArrayList<>(dto.inventors()));
        if (dto.assignees() != null)
            e.setAssignees(new ArrayList<>(dto.assignees()));
        if (dto.ipcClasses() != null)
            e.setIpcClasses(new ArrayList<>(dto.ipcClasses()));
        if (dto.cpcClasses() != null)
            e.setCpcClasses(new ArrayList<>(dto.cpcClasses()));

        if (dto.links() != null) {
            var links = new ArrayList<PatentLink>();
            for (var l : dto.links()) {
                var pl = new PatentLink();
                pl.setType(parseLinkType(l.type()));
                pl.setTitle(l.title());
                pl.setUrl(l.url());
                links.add(pl);
            }
            e.setLinks(links);
        }

        Integer maxOrder = patentRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = patentRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public PatentResponseDto update(Long resumeId, Long patentId, PatentUpdateDto dto) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = patentRepository.findByIdAndResume_Id(patentId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The patent does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Patent version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for patent id=" + patentId);
        }

        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.patentNumber() != null)
            e.setPatentNumber(dto.patentNumber());
        if (dto.applicationNumber() != null)
            e.setApplicationNumber(dto.applicationNumber());
        if (dto.priorityNumber() != null)
            e.setPriorityNumber(dto.priorityNumber());
        if (dto.pctNumber() != null)
            e.setPctNumber(dto.pctNumber());

        if (dto.filingDate() != null)
            e.setFilingDate(dto.filingDate());
        if (dto.grantDate() != null)
            e.setGrantDate(dto.grantDate());
        if (dto.publicationDate() != null)
            e.setPublicationDate(dto.publicationDate());

        if (dto.status() != null)
            e.setStatus(parseStatus(dto.status()));
        if (dto.office() != null)
            e.setOffice(parseOffice(dto.office()));
        if (dto.jurisdictionCountry() != null)
            e.setJurisdictionCountry(dto.jurisdictionCountry().toUpperCase());

        if (dto.kindCode() != null)
            e.setKindCode(dto.kindCode());
        if (dto.familyId() != null)
            e.setFamilyId(dto.familyId());

        if (dto.shortDescription() != null)
            e.setShortDescription(dto.shortDescription());
        if (dto.claimsSummary() != null)
            e.setClaimsSummary(dto.claimsSummary());
        if (dto.officialUrl() != null)
            e.setOfficialUrl(dto.officialUrl());

        if (dto.inventors() != null)
            e.setInventors(new ArrayList<>(dto.inventors()));
        if (dto.assignees() != null)
            e.setAssignees(new ArrayList<>(dto.assignees()));
        if (dto.ipcClasses() != null)
            e.setIpcClasses(new ArrayList<>(dto.ipcClasses()));
        if (dto.cpcClasses() != null)
            e.setCpcClasses(new ArrayList<>(dto.cpcClasses()));

        if (dto.links() != null) {
            var links = new ArrayList<PatentLink>();
            for (var l : dto.links()) {
                var pl = new PatentLink();
                pl.setType(parseLinkType(l.type()));
                pl.setTitle(l.title());
                pl.setUrl(l.url());
                links.add(pl);
            }
            e.setLinks(links);
        }

        e = patentRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long patentId) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = patentRepository.findByIdAndResume_Id(patentId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The patent does not belong to the specified resume."));
        patentRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        var username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during patents reorder.");
        }

        var items = patentRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match patents count.");
        }

        var byId = new HashMap<Long, PatentEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Patent not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        patentRepository.saveAll(items);
    }

    private PatentStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return PatentStatus.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid status. Allowed: FILED, PENDING, GRANTED, EXPIRED, ABANDONED, WITHDRAWN");
        }
    }

    private PatentOffice parseOffice(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace('-', '_');
        try {
            return PatentOffice.valueOf(key);
        } catch (IllegalArgumentException ex) {
            return PatentOffice.OTHER;
        }
    }

    private PatentLinkType parseLinkType(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace('-', '_');
        try {
            return PatentLinkType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            return PatentLinkType.OTHER;
        }
    }
}