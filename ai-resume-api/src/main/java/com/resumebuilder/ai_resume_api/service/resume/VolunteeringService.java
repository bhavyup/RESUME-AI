package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.VolunteeringEntity;
import com.resumebuilder.ai_resume_api.entity.embedded.VolunteerLink;
import com.resumebuilder.ai_resume_api.enums.*;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.repository.resume.VolunteeringRepository;
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
public class VolunteeringService {

    private final VolunteeringRepository volunteeringRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public VolunteeringService(VolunteeringRepository volunteeringRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.volunteeringRepository = volunteeringRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<VolunteeringResponseDto> list(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = volunteeringRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toVolunteerDtoList(list);
    }

    @Transactional(readOnly = true)
    public VolunteeringResponseDto getOne(Long resumeId, Long volunteeringId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = volunteeringRepository.findByIdAndResume_Id(volunteeringId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException(
                        "The volunteering entry does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public VolunteeringResponseDto create(Long resumeId, VolunteeringRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        validateDates(dto.startDate(), dto.endDate());

        var e = new VolunteeringEntity();
        e.setResume(resume);

        e.setTitle(dto.title());
        e.setOrganization(dto.organization());

        e.setType(parseType(dto.type()));
        e.setStatus(parseStatus(dto.status()));
        e.setEngagementMode(parseMode(dto.engagementMode()));
        e.setCause(parseCause(dto.cause()));

        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());
        e.setHours(dto.hours());

        e.setCity(dto.city());
        e.setRegion(dto.region());
        e.setCountry(dto.country());

        e.setOrgWebsiteUrl(dto.orgWebsiteUrl());
        e.setCoverImageUrl(dto.coverImageUrl());

        e.setDescription(dto.description());
        e.setNotes(dto.notes());

        if (dto.responsibilities() != null)
            e.setResponsibilities(new ArrayList<>(dto.responsibilities()));
        if (dto.impacts() != null)
            e.setImpacts(new ArrayList<>(dto.impacts()));
        if (dto.mentees() != null)
            e.setMentees(new ArrayList<>(dto.mentees()));
        if (dto.events() != null)
            e.setEvents(new ArrayList<>(dto.events()));
        if (dto.teachingTopics() != null)
            e.setTeachingTopics(new ArrayList<>(dto.teachingTopics()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));
        if (dto.referenceUrls() != null)
            e.setReferenceUrls(new ArrayList<>(dto.referenceUrls()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        // Derive status if not provided
        if (e.getStatus() == null)
            e.setStatus(deriveStatus(e.getStartDate(), e.getEndDate()));

        Integer maxOrder = volunteeringRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = volunteeringRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public VolunteeringResponseDto update(Long resumeId, Long volunteeringId, VolunteeringUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = volunteeringRepository.findByIdAndResume_Id(volunteeringId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException(
                        "The volunteering entry does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Volunteering version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for volunteering id=" + volunteeringId);
        }

        LocalDate newStart = dto.startDate() != null ? dto.startDate() : e.getStartDate();
        LocalDate newEnd = dto.endDate() != null ? dto.endDate() : e.getEndDate();
        validateDates(newStart, newEnd);

        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.organization() != null)
            e.setOrganization(dto.organization());

        if (dto.type() != null)
            e.setType(parseType(dto.type()));
        if (dto.status() != null)
            e.setStatus(parseStatus(dto.status()));
        if (dto.engagementMode() != null)
            e.setEngagementMode(parseMode(dto.engagementMode()));
        if (dto.cause() != null)
            e.setCause(parseCause(dto.cause()));

        if (dto.startDate() != null)
            e.setStartDate(dto.startDate());
        if (dto.endDate() != null)
            e.setEndDate(dto.endDate());
        if (dto.hours() != null)
            e.setHours(dto.hours());

        if (dto.city() != null)
            e.setCity(dto.city());
        if (dto.region() != null)
            e.setRegion(dto.region());
        if (dto.country() != null)
            e.setCountry(dto.country());

        if (dto.orgWebsiteUrl() != null)
            e.setOrgWebsiteUrl(dto.orgWebsiteUrl());
        if (dto.coverImageUrl() != null)
            e.setCoverImageUrl(dto.coverImageUrl());

        if (dto.description() != null)
            e.setDescription(dto.description());
        if (dto.notes() != null)
            e.setNotes(dto.notes());

        if (dto.responsibilities() != null)
            e.setResponsibilities(new ArrayList<>(dto.responsibilities()));
        if (dto.impacts() != null)
            e.setImpacts(new ArrayList<>(dto.impacts()));
        if (dto.mentees() != null)
            e.setMentees(new ArrayList<>(dto.mentees()));
        if (dto.events() != null)
            e.setEvents(new ArrayList<>(dto.events()));
        if (dto.teachingTopics() != null)
            e.setTeachingTopics(new ArrayList<>(dto.teachingTopics()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));
        if (dto.referenceUrls() != null)
            e.setReferenceUrls(new ArrayList<>(dto.referenceUrls()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        // If status not explicitly set, keep it consistent with date changes
        if (dto.status() == null)
            e.setStatus(deriveStatus(e.getStartDate(), e.getEndDate()));

        e = volunteeringRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long volunteeringId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = volunteeringRepository.findByIdAndResume_Id(volunteeringId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException(
                        "The volunteering entry does not belong to the specified resume."));
        volunteeringRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during volunteering reorder.");
        }

        var items = volunteeringRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match volunteering count.");
        }

        var byId = new HashMap<Long, VolunteeringEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Volunteering entry not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        volunteeringRepository.saveAll(items);
    }

    // ------------------------ Helpers ------------------------

    private void validateDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }
    }

    private VolunteerStatus deriveStatus(LocalDate start, LocalDate end) {
        var today = LocalDate.now();
        if (start == null && end == null)
            return VolunteerStatus.ONGOING;
        if (end != null && end.isBefore(today))
            return VolunteerStatus.COMPLETED;
        if (start != null && start.isAfter(today))
            return VolunteerStatus.PLANNED;
        return VolunteerStatus.ONGOING;
    }

    private List<VolunteerLink> mapLinks(List<VolunteerLinkDto> links) {
        var out = new ArrayList<VolunteerLink>();
        for (var l : links) {
            var vl = new VolunteerLink();
            vl.setType(parseLinkType(l.type()));
            vl.setTitle(l.title());
            vl.setUrl(l.url());
            out.add(vl);
        }
        return out;
    }

    private VolunteerType parseType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return VolunteerType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid type. Allowed: VOLUNTEER, LEADERSHIP, MENTORING, ORGANIZING, TEACHING, TUTORING, COACHING, PRO_BONO, COMMUNITY");
        }
    }

    private VolunteerStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return VolunteerStatus.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Allowed: ONGOING, COMPLETED, PLANNED, PAUSED");
        }
    }

    private VolunteerEngagementMode parseMode(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return VolunteerEngagementMode.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid engagementMode. Allowed: IN_PERSON, VIRTUAL, HYBRID");
        }
    }

    private VolunteerCause parseCause(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return VolunteerCause.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid cause. Allowed: EDUCATION, ENVIRONMENT, HEALTH, ANIMALS, TECHNOLOGY, ARTS, SPORTS, COMMUNITY, HUMAN_RIGHTS, DISASTER_RELIEF, OTHER");
        }
    }

    private VolunteerLinkType parseLinkType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return VolunteerLinkType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid link.type. Allowed: ORG, EVENT, PROJECT, MEDIA, PRESS, REPO, PHOTOS, OTHER");
        }
    }
}