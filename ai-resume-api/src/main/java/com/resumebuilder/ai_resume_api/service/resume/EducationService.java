package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.EducationResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.EducationDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.EducationRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EducationService {
    private final EducationRepository educationRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public EducationService(EducationRepository educationRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.educationRepository = educationRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    public EducationResponseDto addEducationToResume(Long resumeId, EducationDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var e = new EducationEntity();
        e.setInstitution(dto.institution());
        e.setInstitutionWebsite(dto.institutionWebsite());

        e.setDegree(dto.degree());
        e.setFieldOfStudy(dto.fieldOfStudy());

        e.setLocationCity(dto.locationCity());
        e.setLocationCountry(dto.locationCountry());

        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());

        e.setGraduationDate(dto.graduationDate());
        e.setExpectedGraduation(Boolean.TRUE.equals(dto.expectedGraduation()));
        e.setCurrentlyEnrolled(Boolean.TRUE.equals(dto.currentlyEnrolled()));
        if (e.isCurrentlyEnrolled()) {
            e.setEndDate(null);
        }

        if (dto.courses() != null)
            e.setCourses(new java.util.ArrayList<>(dto.courses()));

        e.setGpa(dto.gpa());
        e.setShowGpa(dto.showGpa() == null ? true : dto.showGpa());

        e.setHonors(dto.honors());
        e.setShowHonors(dto.showHonors() == null ? true : dto.showHonors());
        e.setGradeClass(dto.gradeClass());

        e.setDescription(dto.description());

        if (dto.awards() != null)
            e.setAwards(new java.util.ArrayList<>(dto.awards()));

        if (dto.projects() != null) {
            var links = new java.util.ArrayList<com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink>();
            for (var l : dto.projects()) {
                var el = new com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink();
                el.setTitle(l.title());
                el.setUrl(l.url());
                links.add(el);
            }
            e.setProjects(links);
        }

        e.setResume(resume);

        Integer maxOrder = educationRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = educationRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public EducationResponseDto updateEducation(Long resumeId, long eduId,
            com.resumebuilder.ai_resume_api.dto.resume.EducationUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = educationRepository.findByIdAndResume_Id(eduId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The education does not belong to the specified resume."));

        if (dto.version() == null) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Education version is required for update.");
        }
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for education id=" + eduId);
        }

        if (dto.institution() != null)
            e.setInstitution(dto.institution());
        if (dto.institutionWebsite() != null)
            e.setInstitutionWebsite(dto.institutionWebsite());

        if (dto.degree() != null)
            e.setDegree(dto.degree());
        if (dto.fieldOfStudy() != null)
            e.setFieldOfStudy(dto.fieldOfStudy());

        if (dto.locationCity() != null)
            e.setLocationCity(dto.locationCity());
        if (dto.locationCountry() != null)
            e.setLocationCountry(dto.locationCountry());

        if (dto.startDate() != null)
            e.setStartDate(dto.startDate());
        if (dto.currentlyEnrolled() != null)
            e.setCurrentlyEnrolled(dto.currentlyEnrolled());
        if (e.isCurrentlyEnrolled()) {
            e.setEndDate(null);
        } else if (dto.endDate() != null) {
            e.setEndDate(dto.endDate());
        }

        if (dto.graduationDate() != null)
            e.setGraduationDate(dto.graduationDate());
        if (dto.expectedGraduation() != null)
            e.setExpectedGraduation(dto.expectedGraduation());

        if (dto.courses() != null)
            e.setCourses(new java.util.ArrayList<>(dto.courses()));

        if (dto.gpa() != null)
            e.setGpa(dto.gpa());
        if (dto.showGpa() != null)
            e.setShowGpa(dto.showGpa());

        if (dto.honors() != null)
            e.setHonors(dto.honors());
        if (dto.showHonors() != null)
            e.setShowHonors(dto.showHonors());
        if (dto.gradeClass() != null)
            e.setGradeClass(dto.gradeClass());

        if (dto.description() != null)
            e.setDescription(dto.description());

        if (dto.awards() != null)
            e.setAwards(new java.util.ArrayList<>(dto.awards()));

        if (dto.projects() != null) {
            var links = new java.util.ArrayList<com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink>();
            for (var l : dto.projects()) {
                var el = new com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink();
                el.setTitle(l.title());
                el.setUrl(l.url());
                links.add(el);
            }
            e.setProjects(links);
        }

        e = educationRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void deleteEducation(Long resumeId, Long eduId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var edu = educationRepository.findByIdAndResume_Id(eduId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The education does not belong to the specified resume."));
        educationRepository.delete(edu);
    }

    public void reorderEducations(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during education reorder.");
        }

        var items = educationRepository.findAllByResume_Id(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match educations count.");
        }

        var byId = new java.util.HashMap<Long, EducationEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Education not found in this resume: id=" + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        educationRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public java.util.List<EducationResponseDto> listEducations(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = educationRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toEducationDtoList(list);
    }

    @Transactional(readOnly = true)
    public EducationResponseDto getEducation(Long resumeId, Long eduId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = educationRepository.findByIdAndResume_Id(eduId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The education does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }
}