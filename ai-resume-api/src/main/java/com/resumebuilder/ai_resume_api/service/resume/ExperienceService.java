package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ExperienceDto;
import com.resumebuilder.ai_resume_api.dto.resume.ExperienceResponseDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ExperienceRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public ExperienceService(ExperienceRepository experienceRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.experienceRepository = experienceRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    public ExperienceResponseDto addExperienceToResume(Long resumeId, ExperienceDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var e = new ExperienceEntity();
        e.setJobTitle(dto.jobTitle());
        e.setCompanyName(dto.companyName());
        e.setCompanyWebsite(dto.companyWebsite());

        // Locations
        e.setLocation(dto.location());
        e.setLocationCity(dto.locationCity());
        e.setLocationState(dto.locationState());
        e.setLocationCountry(dto.locationCountry());
        e.setRemote(Boolean.TRUE.equals(dto.remote()));

        // Employment info
        e.setEmploymentType(parseEmploymentType(dto.employmentType()));
        e.setStartDate(dto.startDate());
        e.setEndDate(dto.endDate());
        e.setCurrentlyWorking(Boolean.TRUE.equals(dto.currentlyWorking()));
        if (e.isCurrentlyWorking()) {
            e.setEndDate(null);
        } else if (e.getStartDate() != null && e.getEndDate() != null && e.getEndDate().isBefore(e.getStartDate())) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "endDate cannot be before startDate.");
        }

        // Narrative + structured bullets/tags
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

        // Manager / team / seniority
        e.setManagerName(dto.managerName());
        e.setManagerContact(dto.managerContact());
        e.setTeamSize(dto.teamSize());
        e.setSeniorityLevel(parseSeniorityLevel(dto.seniorityLevel()));
        e.setReportsToTitle(dto.reportsToTitle());

        // Flags + STAR
        e.setConfidential(Boolean.TRUE.equals(dto.confidential()));
        e.setStarSituation(dto.starSituation());
        e.setStarTask(dto.starTask());
        e.setStarAction(dto.starAction());
        e.setStarResult(dto.starResult());

        // KPIs
        e.setKpiRevenueImpactUsd(dto.kpiRevenueImpactUsd());
        e.setKpiPercentImprovement(dto.kpiPercentImprovement());
        e.setKpiTimeSavedHours(dto.kpiTimeSavedHours());
        e.setKpiUsers(dto.kpiUsers());
        e.setKpiArrUsd(dto.kpiArrUsd());

        e.setResume(resume);

        Integer maxOrder = experienceRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = experienceRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public ExperienceResponseDto updateExperience(Long resumeId, Long experienceId,
            com.resumebuilder.ai_resume_api.dto.resume.ExperienceUpdateDto dto) {

        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = experienceRepository.findByIdAndResume_Id(experienceId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The experience does not belong to the specified resume."));

        if (dto.version() == null) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Experience version is required for update.");
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
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "endDate cannot be before startDate.");
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

    public void deleteExperience(Long resumeId, Long experienceId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = experienceRepository.findByIdAndResume_Id(experienceId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The experience does not belong to the specified resume."));
        experienceRepository.delete(e);
    }

    public void reorderExperiences(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during experience reorder.");
        }

        var items = experienceRepository.findAllByResume_Id(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match experiences count.");
        }

        var byId = new java.util.HashMap<Long, ExperienceEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        // Validate all ids exist and are unique
        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Experience not found in this resume: id=" + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        experienceRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public java.util.List<ExperienceResponseDto> listExperiences(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var list = experienceRepository.findAllByResume_IdOrderByDisplayOrderAscStartDateDescIdAsc(resume.getId());
        return resumeMapper.toExperienceDtoList(list);
    }

    @Transactional(readOnly = true)
    public ExperienceResponseDto getExperience(Long resumeId, Long experienceId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var e = experienceRepository.findByIdAndResume_Id(experienceId, resume.getId())
                .orElseThrow(
                        () -> new AccessDeniedException("The experience does not belong to the specified resume."));
        return resumeMapper.toDto(e);
    }

    private com.resumebuilder.ai_resume_api.enums.EmploymentType parseEmploymentType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return com.resumebuilder.ai_resume_api.enums.EmploymentType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
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
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Invalid seniorityLevel. Allowed: INTERN,JUNIOR,MID,SENIOR,LEAD,STAFF,PRINCIPAL,MANAGER,DIRECTOR,VP,C_LEVEL,OTHER");
        }
    }
}