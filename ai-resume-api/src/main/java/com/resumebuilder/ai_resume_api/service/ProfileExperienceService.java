package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ExperienceDto;
import com.resumebuilder.ai_resume_api.dto.resume.ExperienceResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ExperienceUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoExperienceEntity;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoExperienceRepository;
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
public class ProfileExperienceService {

    private final PersonalInfoExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileExperienceService(PersonalInfoExperienceRepository experienceRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.experienceRepository = experienceRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    public ExperienceResponseDto addExperience(ExperienceDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        var e = new PersonalInfoExperienceEntity();
        e.setJobTitle(dto.jobTitle());
        e.setCompanyName(dto.companyName());
        e.setCompanyWebsite(dto.companyWebsite());

        e.setLocation(dto.location());
        e.setLocationCity(dto.locationCity());
        e.setLocationState(dto.locationState());
        e.setLocationCountry(dto.locationCountry());
        e.setRemote(Boolean.TRUE.equals(dto.remote()));

        e.setEmploymentType(parseEmploymentType(dto.employmentType()));
        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());
        e.setCurrentlyWorking(Boolean.TRUE.equals(dto.currentlyWorking()));
        if (e.isCurrentlyWorking()) {
            e.setEndDate(null);
        } else if (e.getStartDate() != null && e.getEndDate() != null && e.getEndDate().isBefore(e.getStartDate())) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }

        e.setDescription(dto.description());
        if (dto.responsibilities() != null)
            e.setResponsibilities(new java.util.ArrayList<>(dto.responsibilities()));
        if (dto.achievements() != null)
            e.setAchievements(new java.util.ArrayList<>(dto.achievements()));
        if (dto.technologies() != null)
            e.setTechnologies(new java.util.ArrayList<>(dto.technologies()));
        if (dto.methods() != null)
            e.setMethods(new java.util.ArrayList<>(dto.methods()));
        if (dto.links() != null) {
            var links = new java.util.ArrayList<com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink>();
            for (var l : dto.links()) {
                var el = new com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink();
                el.setTitle(l.title());
                el.setUrl(l.url());
                links.add(el);
            }
            e.setLinks(links);
        }

        e.setManagerName(dto.managerName());
        e.setManagerContact(dto.managerContact());
        e.setTeamSize(dto.teamSize());
        e.setSeniorityLevel(parseSeniorityLevel(dto.seniorityLevel()));
        e.setReportsToTitle(dto.reportsToTitle());

        e.setConfidential(Boolean.TRUE.equals(dto.confidential()));
        e.setStarSituation(dto.starSituation());
        e.setStarTask(dto.starTask());
        e.setStarAction(dto.starAction());
        e.setStarResult(dto.starResult());

        e.setKpiRevenueImpactUsd(dto.kpiRevenueImpactUsd());
        e.setKpiPercentImprovement(dto.kpiPercentImprovement());
        e.setKpiTimeSavedHours(dto.kpiTimeSavedHours());
        e.setKpiUsers(dto.kpiUsers());
        e.setKpiArrUsd(dto.kpiArrUsd());

        e.setPersonalInfo(personalInfo);

        Integer maxOrder = experienceRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = experienceRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public ExperienceResponseDto updateExperience(Long experienceId, ExperienceUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = experienceRepository.findByIdAndPersonalInfo_Id(experienceId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This experience does not belong to your profile."));

        if (dto.version() == null) {
            throw new BadRequestException("Experience version is required for update.");
        }
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for experience id=" + experienceId);
        }

        if (dto.jobTitle() != null)
            e.setJobTitle(dto.jobTitle());
        if (dto.companyName() != null)
            e.setCompanyName(dto.companyName());
        if (dto.companyWebsite() != null)
            e.setCompanyWebsite(dto.companyWebsite());

        if (dto.location() != null)
            e.setLocation(dto.location());
        if (dto.locationCity() != null)
            e.setLocationCity(dto.locationCity());
        if (dto.locationState() != null)
            e.setLocationState(dto.locationState());
        if (dto.locationCountry() != null)
            e.setLocationCountry(dto.locationCountry());
        if (dto.remote() != null)
            e.setRemote(dto.remote());

        if (dto.employmentType() != null)
            e.setEmploymentType(parseEmploymentType(dto.employmentType()));

        if (dto.startDate() != null)
            e.setStartDate(dto.startDate());
        if (dto.currentlyWorking() != null)
            e.setCurrentlyWorking(dto.currentlyWorking());
        if (e.isCurrentlyWorking()) {
            e.setEndDate(null);
        } else if (dto.endDate() != null) {
            e.setEndDate(dto.endDate());
        }
        if (e.getStartDate() != null && e.getEndDate() != null && e.getEndDate().isBefore(e.getStartDate())) {
            throw new BadRequestException("endDate cannot be before startDate.");
        }

        if (dto.description() != null)
            e.setDescription(dto.description());
        if (dto.responsibilities() != null)
            e.setResponsibilities(new java.util.ArrayList<>(dto.responsibilities()));
        if (dto.achievements() != null)
            e.setAchievements(new java.util.ArrayList<>(dto.achievements()));
        if (dto.technologies() != null)
            e.setTechnologies(new java.util.ArrayList<>(dto.technologies()));
        if (dto.methods() != null)
            e.setMethods(new java.util.ArrayList<>(dto.methods()));
        if (dto.links() != null) {
            var links = new java.util.ArrayList<com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink>();
            for (var l : dto.links()) {
                var el = new com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink();
                el.setTitle(l.title());
                el.setUrl(l.url());
                links.add(el);
            }
            e.setLinks(links);
        }

        if (dto.managerName() != null)
            e.setManagerName(dto.managerName());
        if (dto.managerContact() != null)
            e.setManagerContact(dto.managerContact());
        if (dto.teamSize() != null)
            e.setTeamSize(dto.teamSize());
        if (dto.seniorityLevel() != null)
            e.setSeniorityLevel(parseSeniorityLevel(dto.seniorityLevel()));
        if (dto.reportsToTitle() != null)
            e.setReportsToTitle(dto.reportsToTitle());

        if (dto.confidential() != null)
            e.setConfidential(dto.confidential());
        if (dto.starSituation() != null)
            e.setStarSituation(dto.starSituation());
        if (dto.starTask() != null)
            e.setStarTask(dto.starTask());
        if (dto.starAction() != null)
            e.setStarAction(dto.starAction());
        if (dto.starResult() != null)
            e.setStarResult(dto.starResult());

        if (dto.kpiRevenueImpactUsd() != null)
            e.setKpiRevenueImpactUsd(dto.kpiRevenueImpactUsd());
        if (dto.kpiPercentImprovement() != null)
            e.setKpiPercentImprovement(dto.kpiPercentImprovement());
        if (dto.kpiTimeSavedHours() != null)
            e.setKpiTimeSavedHours(dto.kpiTimeSavedHours());
        if (dto.kpiUsers() != null)
            e.setKpiUsers(dto.kpiUsers());
        if (dto.kpiArrUsd() != null)
            e.setKpiArrUsd(dto.kpiArrUsd());

        e = experienceRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void deleteExperience(Long experienceId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = experienceRepository.findByIdAndPersonalInfo_Id(experienceId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This experience does not belong to your profile."));
        experienceRepository.delete(e);
    }

    public void reorderExperiences(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = experienceRepository.findAllByPersonalInfo_Id(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match experiences count.");
        }

        var byId = new HashMap<Long, PersonalInfoExperienceEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Experience not found in your profile: id=" + id);
            }
            if (!seen.add(id)) {
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        experienceRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public List<ExperienceResponseDto> listExperiences() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = experienceRepository
                .findAllByPersonalInfo_IdOrderByDisplayOrderAscStartDateDescIdAsc(personalInfo.getId());
        return resumeMapper.toProfileExperienceDtoList(list);
    }

    @Transactional(readOnly = true)
    public ExperienceResponseDto getExperience(Long experienceId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = experienceRepository.findByIdAndPersonalInfo_Id(experienceId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This experience does not belong to your profile."));
        return resumeMapper.toDto(e);
    }

    private com.resumebuilder.ai_resume_api.enums.EmploymentType parseEmploymentType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return com.resumebuilder.ai_resume_api.enums.EmploymentType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid employmentType. Allowed: FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, TEMPORARY");
        }
    }

    private com.resumebuilder.ai_resume_api.enums.SeniorityLevel parseSeniorityLevel(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return com.resumebuilder.ai_resume_api.enums.SeniorityLevel.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid seniorityLevel. Allowed: INTERN,JUNIOR,MID,SENIOR,LEAD,STAFF,PRINCIPAL,MANAGER,DIRECTOR,VP,C_LEVEL,OTHER");
        }
    }
}