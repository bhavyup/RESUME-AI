package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseLinkDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.CourseUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoCourseEntity;
import com.resumebuilder.ai_resume_api.entity.embedded.CourseLink;
import com.resumebuilder.ai_resume_api.enums.CourseDeliveryMode;
import com.resumebuilder.ai_resume_api.enums.CourseLevel;
import com.resumebuilder.ai_resume_api.enums.CourseLinkType;
import com.resumebuilder.ai_resume_api.enums.CourseStatus;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoCourseRepository;
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
public class ProfileCourseService {

    private final PersonalInfoCourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileCourseService(PersonalInfoCourseRepository courseRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> list() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = courseRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileCourseDtoList(list);
    }

    @Transactional(readOnly = true)
    public CourseResponseDto getOne(Long courseId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = courseRepository.findByIdAndPersonalInfo_Id(courseId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This course does not belong to your profile."));
        return resumeMapper.toDto(e);
    }

    public CourseResponseDto create(CourseRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        validateDates(dto.startDate(), dto.endDate(), dto.completionDate());
        if (dto.status() != null && parseStatus(dto.status()) == CourseStatus.COMPLETED
                && dto.completionDate() == null) {
            throw new BadRequestException("completionDate is required when status is COMPLETED.");
        }

        var e = new PersonalInfoCourseEntity();
        e.setPersonalInfo(personalInfo);

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

        Integer maxOrder = courseRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = courseRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public CourseResponseDto update(Long courseId, CourseUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = courseRepository.findByIdAndPersonalInfo_Id(courseId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This course does not belong to your profile."));

        if (dto.version() == null)
            throw new BadRequestException("Course version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for course id=" + courseId);
        }

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

    public void delete(Long courseId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = courseRepository.findByIdAndPersonalInfo_Id(courseId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This course does not belong to your profile."));
        courseRepository.delete(e);
    }

    public void reorder(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = courseRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match courses count.");
        }

        var byId = new HashMap<Long, PersonalInfoCourseEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Course not found in your profile: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        courseRepository.saveAll(items);
    }

    private void validateDates(LocalDate start, LocalDate end, LocalDate completion) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }
        if (completion != null && start != null && completion.isBefore(start)) {
            throw new BadRequestException("completionDate cannot be before startDate.");
        }
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