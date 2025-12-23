package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.EducationDto;
import com.resumebuilder.ai_resume_api.dto.resume.EducationResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.EducationUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoEducationEntity;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoEducationRepository;
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
public class ProfileEducationService {

    private final PersonalInfoEducationRepository educationRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileEducationService(PersonalInfoEducationRepository educationRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.educationRepository = educationRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    public EducationResponseDto addEducation(EducationDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        var e = new PersonalInfoEducationEntity();
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

        e.setPersonalInfo(personalInfo);

        Integer maxOrder = educationRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = educationRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public EducationResponseDto updateEducation(Long eduId, EducationUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = educationRepository.findByIdAndPersonalInfo_Id(eduId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This education does not belong to your profile."));

        if (dto.version() == null) {
            throw new BadRequestException("Education version is required for update.");
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

    public void deleteEducation(Long eduId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var edu = educationRepository.findByIdAndPersonalInfo_Id(eduId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This education does not belong to your profile."));
        educationRepository.delete(edu);
    }

    public void reorderEducations(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = educationRepository.findAllByPersonalInfo_Id(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match educations count.");
        }

        var byId = new HashMap<Long, PersonalInfoEducationEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Education not found in your profile: id=" + id);
            }
            if (!seen.add(id)) {
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        educationRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public List<EducationResponseDto> listEducations() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = educationRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileEducationDtoList(list);
    }

    @Transactional(readOnly = true)
    public EducationResponseDto getEducation(Long eduId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = educationRepository.findByIdAndPersonalInfo_Id(eduId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This education does not belong to your profile."));
        return resumeMapper.toDto(e);
    }
}