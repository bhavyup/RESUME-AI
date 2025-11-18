package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.ReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseLinkDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseUpdateDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.entity.embedded.CourseLink;
import com.resumebuilder.ai_resume_api.enums.CourseDeliveryMode;
import com.resumebuilder.ai_resume_api.enums.CourseLevel;
import com.resumebuilder.ai_resume_api.enums.CourseLinkType;
import com.resumebuilder.ai_resume_api.enums.CourseStatus;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.CourseRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
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
public class CourseService {

    private final CourseRepository courseRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public CourseService(CourseRepository courseRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.courseRepository = courseRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> list(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = courseRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toCourseDtoList(list);
    }

    @Transactional(readOnly = true)
    public CourseResponseDto getOne(Long resumeId, Long courseId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = courseRepository.findByIdAndResume_Id(courseId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The course does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    public CourseResponseDto create(Long resumeId, CourseRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        validateDates(dto.startDate(), dto.endDate(), dto.completionDate());
        // If caller sets status=COMPLETED, ensure completionDate
        if (dto.status() != null && parseStatus(dto.status()) == CourseStatus.COMPLETED
                && dto.completionDate() == null) {
            throw new BadRequestException("completionDate is required when status is COMPLETED.");
        }

        var e = new CourseEntity();
        e.setResume(resume);

        e.setTitle(dto.title());
        e.setProvider(dto.provider());
        e.setPlatform(dto.platform());

        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());
        e.setCompletionDate(dto.completionDate());

        e.setHours(dto.hours());
        e.setCredentialId(dto.credentialId());
        e.setCredentialUrl(dto.credentialUrl());
        e.setCertificateUrl(dto.certificateUrl());

        e.setGrade(dto.grade());
        e.setScore(dto.score());
        e.setScoreUnit(dto.scoreUnit());

        e.setLevel(parseLevel(dto.level()));
        e.setDeliveryMode(parseDeliveryMode(dto.deliveryMode()));

        var status = parseStatus(dto.status());
        if (status == null)
            status = deriveStatus(e.getStartDate(), e.getEndDate(), e.getCompletionDate());
        e.setStatus(status);

        e.setDescription(dto.description());
        e.setNotes(dto.notes());

        if (dto.instructors() != null)
            e.setInstructors(new ArrayList<>(dto.instructors()));
        if (dto.topics() != null)
            e.setTopics(new ArrayList<>(dto.topics()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        Integer maxOrder = courseRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = courseRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public CourseResponseDto update(Long resumeId, Long courseId, CourseUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = courseRepository.findByIdAndResume_Id(courseId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The course does not belong to the specified resume."));

        if (dto.version() == null)
            throw new BadRequestException("Course version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for course id=" + courseId);
        }

        // Determine future state for validation
        LocalDate newStart = dto.startDate() != null ? dto.startDate() : e.getStartDate();
        LocalDate newEnd = dto.endDate() != null ? dto.endDate() : e.getEndDate();
        LocalDate newCompletion = dto.completionDate() != null ? dto.completionDate() : e.getCompletionDate();
        validateDates(newStart, newEnd, newCompletion);

        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.provider() != null)
            e.setProvider(dto.provider());
        if (dto.platform() != null)
            e.setPlatform(dto.platform());

        if (dto.startDate() != null)
            e.setStartDate(dto.startDate());
        if (dto.endDate() != null)
            e.setEndDate(dto.endDate());
        if (dto.completionDate() != null)
            e.setCompletionDate(dto.completionDate());

        if (dto.hours() != null)
            e.setHours(dto.hours());
        if (dto.credentialId() != null)
            e.setCredentialId(dto.credentialId());
        if (dto.credentialUrl() != null)
            e.setCredentialUrl(dto.credentialUrl());
        if (dto.certificateUrl() != null)
            e.setCertificateUrl(dto.certificateUrl());

        if (dto.grade() != null)
            e.setGrade(dto.grade());
        if (dto.score() != null)
            e.setScore(dto.score());
        if (dto.scoreUnit() != null)
            e.setScoreUnit(dto.scoreUnit());

        if (dto.level() != null)
            e.setLevel(parseLevel(dto.level()));
        if (dto.deliveryMode() != null)
            e.setDeliveryMode(parseDeliveryMode(dto.deliveryMode()));

        if (dto.status() != null) {
            var newStatus = parseStatus(dto.status());
            if (newStatus == CourseStatus.COMPLETED
                    && (dto.completionDate() == null && e.getCompletionDate() == null)) {
                throw new BadRequestException("completionDate is required when status is COMPLETED.");
            }
            e.setStatus(newStatus);
        } else {
            // Keep status consistent if dates changed
            e.setStatus(deriveStatus(e.getStartDate(), e.getEndDate(), e.getCompletionDate()));
        }

        if (dto.description() != null)
            e.setDescription(dto.description());
        if (dto.notes() != null)
            e.setNotes(dto.notes());

        if (dto.instructors() != null)
            e.setInstructors(new ArrayList<>(dto.instructors()));
        if (dto.topics() != null)
            e.setTopics(new ArrayList<>(dto.topics()));
        if (dto.links() != null)
            e.setLinks(mapLinks(dto.links()));

        e = courseRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long resumeId, Long courseId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = courseRepository.findByIdAndResume_Id(courseId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The course does not belong to the specified resume."));
        courseRepository.delete(e);
    }

    public void reorder(Long resumeId, ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during courses reorder.");
        }

        var items = courseRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match courses count.");
        }

        var byId = new HashMap<Long, CourseEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Course not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        courseRepository.saveAll(items);
    }

    // ------------------------ Helpers ------------------------

    private void validateDates(LocalDate start, LocalDate end, LocalDate completion) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }
        if (completion != null && start != null && completion.isBefore(start)) {
            throw new BadRequestException("completionDate cannot be before startDate.");
        }
        // We allow completionDate after endDate (late completion) — no hard restriction
        // here.
    }

    private CourseStatus deriveStatus(LocalDate start, LocalDate end, LocalDate completion) {
        var today = LocalDate.now();
        if (completion != null)
            return CourseStatus.COMPLETED;
        if (end != null && end.isBefore(today))
            return CourseStatus.EXPIRED;
        if (start != null) {
            if (start.isAfter(today))
                return CourseStatus.PLANNED;
            return CourseStatus.IN_PROGRESS;
        }
        // No dates: default to PLANNED
        return CourseStatus.PLANNED;
    }

    private List<CourseLink> mapLinks(List<CourseLinkDto> links) {
        var out = new ArrayList<CourseLink>();
        for (var l : links) {
            var cl = new CourseLink();
            cl.setType(parseLinkType(l.type()));
            cl.setTitle(l.title());
            cl.setUrl(l.url());
            out.add(cl);
        }
        return out;
    }

    private CourseLevel parseLevel(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return CourseLevel.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid level. Allowed: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT");
        }
    }

    private CourseDeliveryMode parseDeliveryMode(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return CourseDeliveryMode.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid deliveryMode. Allowed: ONLINE, OFFLINE, BLENDED");
        }
    }

    private CourseStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return CourseStatus.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status. Allowed: COMPLETED, IN_PROGRESS, PLANNED, EXPIRED");
        }
    }

    private CourseLinkType parseLinkType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return CourseLinkType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid link.type. Allowed: SYLLABUS, PROJECT, REPO, CERTIFICATE, OTHER");
        }
    }
}