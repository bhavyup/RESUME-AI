package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.TalkEntity;
import com.resumebuilder.ai_resume_api.entity.embedded.TalkLink;
import com.resumebuilder.ai_resume_api.enums.TalkLinkType;
import com.resumebuilder.ai_resume_api.enums.TalkRole;
import com.resumebuilder.ai_resume_api.enums.TalkStatus;
import com.resumebuilder.ai_resume_api.enums.TalkType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.repository.resume.TalkRepository;
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
public class TalkService {

    private final TalkRepository talkRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public TalkService(TalkRepository talkRepository, ResumeRepository resumeRepository, ResumeMapper resumeMapper) {
        this.talkRepository = talkRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<TalkResponseDto> list(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = talkRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toTalkDtoList(list);
    }

    @Transactional(readOnly = true)
    public TalkResponseDto getOne(Long resumeId, Long talkId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = talkRepository.findByIdAndResume_Id(talkId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The talk does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public TalkResponseDto create(Long resumeId, TalkRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        validateDates(dto.startDate(), dto.endDate());

        var e = new TalkEntity();
        e.setResume(resume);

        e.setTitle(dto.title());
        e.setEventName(dto.eventName());
        e.setOrganizer(dto.organizer());
        e.setTrack(dto.track());

        e.setType(parseType(dto.type()));
        e.setRole(parseRole(dto.role()));
        var status = parseStatus(dto.status());

        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());

        e.setVirtual(Boolean.TRUE.equals(dto.isVirtual()));
        e.setVenue(dto.venue());
        e.setCity(dto.city());
        e.setRegion(dto.region());
        e.setCountry(dto.country());

        e.setLanguage(dto.language());
        e.setAudienceSize(dto.audienceSize());

        e.setSlidesUrl(dto.slidesUrl());
        e.setVideoUrl(dto.videoUrl());
        e.setEventUrl(dto.eventUrl());
        e.setCoverImageUrl(dto.coverImageUrl());

        e.setAbstractText(dto.abstractText());
        e.setDescription(dto.description());
        e.setNotes(dto.notes());

        if (dto.coSpeakers() != null)
            e.setCoSpeakers(new ArrayList<>(dto.coSpeakers()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        if (status == null)
            status = deriveStatus(e.getStartDate(), e.getEndDate());
        e.setStatus(status);

        Integer maxOrder = talkRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = talkRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public TalkResponseDto update(Long resumeId, Long talkId, TalkUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = talkRepository.findByIdAndResume_Id(talkId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The talk does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Talk version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for talk id=" + talkId);
        }

        LocalDate newStart = dto.startDate() != null ? dto.startDate() : e.getStartDate();
        LocalDate newEnd = dto.endDate() != null ? dto.endDate() : e.getEndDate();
        validateDates(newStart, newEnd);

        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.eventName() != null)
            e.setEventName(dto.eventName());
        if (dto.organizer() != null)
            e.setOrganizer(dto.organizer());
        if (dto.track() != null)
            e.setTrack(dto.track());

        if (dto.type() != null)
            e.setType(parseType(dto.type()));
        if (dto.role() != null)
            e.setRole(parseRole(dto.role()));

        if (dto.startDate() != null)
            e.setStartDate(dto.startDate());
        if (dto.endDate() != null)
            e.setEndDate(dto.endDate());

        if (dto.isVirtual() != null)
            e.setVirtual(dto.isVirtual());
        if (dto.venue() != null)
            e.setVenue(dto.venue());
        if (dto.city() != null)
            e.setCity(dto.city());
        if (dto.region() != null)
            e.setRegion(dto.region());
        if (dto.country() != null)
            e.setCountry(dto.country());

        if (dto.language() != null)
            e.setLanguage(dto.language());
        if (dto.audienceSize() != null)
            e.setAudienceSize(dto.audienceSize());

        if (dto.slidesUrl() != null)
            e.setSlidesUrl(dto.slidesUrl());
        if (dto.videoUrl() != null)
            e.setVideoUrl(dto.videoUrl());
        if (dto.eventUrl() != null)
            e.setEventUrl(dto.eventUrl());
        if (dto.coverImageUrl() != null)
            e.setCoverImageUrl(dto.coverImageUrl());

        if (dto.abstractText() != null)
            e.setAbstractText(dto.abstractText());
        if (dto.description() != null)
            e.setDescription(dto.description());
        if (dto.notes() != null)
            e.setNotes(dto.notes());

        if (dto.coSpeakers() != null)
            e.setCoSpeakers(new ArrayList<>(dto.coSpeakers()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        if (dto.status() != null) {
            e.setStatus(parseStatus(dto.status()));
        } else {
            e.setStatus(deriveStatus(e.getStartDate(), e.getEndDate()));
        }

        e = talkRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long talkId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = talkRepository.findByIdAndResume_Id(talkId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The talk does not belong to the specified resume."));
        talkRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during talks reorder.");
        }

        var items = talkRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match talks count.");
        }

        var byId = new HashMap<Long, TalkEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Talk not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        talkRepository.saveAll(items);
    }

    // ------------------------ Helpers ------------------------

    private void validateDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }
    }

    private TalkStatus deriveStatus(LocalDate start, LocalDate end) {
        var today = LocalDate.now();
        if (start == null && end == null)
            return TalkStatus.SCHEDULED;
        LocalDate effectiveEnd = (end != null) ? end : start;
        if (effectiveEnd != null && effectiveEnd.isBefore(today))
            return TalkStatus.DELIVERED;
        if (start != null && start.isAfter(today))
            return TalkStatus.SCHEDULED;
        return TalkStatus.SCHEDULED;
    }

    private List<TalkLink> mapLinks(List<TalkLinkDto> links) {
        var out = new ArrayList<TalkLink>();
        for (var l : links) {
            var tl = new TalkLink();
            tl.setType(parseLinkType(l.type()));
            tl.setTitle(l.title());
            tl.setUrl(l.url());
            out.add(tl);
        }
        return out;
    }

    private TalkType parseType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return TalkType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid type. Allowed: TALK, WORKSHOP, PANEL, KEYNOTE, WEBINAR, POSTER, LIGHTNING, DEMO");
        }
    }

    private TalkRole parseRole(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return TalkRole.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid role. Allowed: SPEAKER, CO_SPEAKER, PANELIST, MODERATOR, HOST, ORGANIZER, TRAINER");
        }
    }

    private TalkStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return TalkStatus.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Allowed: SCHEDULED, DELIVERED, CANCELLED, POSTPONED");
        }
    }

    private TalkLinkType parseLinkType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return TalkLinkType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid link.type. Allowed: SLIDES, VIDEO, EVENT, REPO, DEMO, PHOTOS, PRESS, OTHER");
        }
    }
}