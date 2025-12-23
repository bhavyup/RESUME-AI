package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoProjectEntity;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectLink;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectMedia;
import com.resumebuilder.ai_resume_api.enums.ProjectLinkType;
import com.resumebuilder.ai_resume_api.enums.ProjectRole;
import com.resumebuilder.ai_resume_api.enums.ProjectType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoProjectRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class ProfileProjectService {

    private final PersonalInfoProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfileProjectService(PersonalInfoProjectRepository projectRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    public ProjectResponseDto createProject(ProjectRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        if (dto.title() == null || dto.title().isBlank()) {
            throw new BadRequestException("Project title is required");
        }

        var p = new PersonalInfoProjectEntity();
        p.setPersonalInfo(personalInfo);

        p.setTitle(dto.title());
        p.setProjectType(parseProjectType(dto.projectType()));
        p.setRole(parseProjectRole(dto.role()));
        p.setShortDescription(dto.shortDescription());

        p.setStartDate(dto.startDate());
        p.setEndDate(dto.endDate());
        p.setCurrentlyActive(Boolean.TRUE.equals(dto.currentlyActive()));
        if (p.isCurrentlyActive())
            p.setEndDate(null);

        if (dto.technologies() != null)
            p.setTechnologies(new ArrayList<>(dto.technologies()));
        if (dto.features() != null)
            p.setFeatures(new ArrayList<>(dto.features()));

        if (dto.links() != null) {
            var links = new ArrayList<ProjectLink>();
            for (var l : dto.links()) {
                var pl = new ProjectLink();
                pl.setType(parseLinkType(l.type()));
                pl.setTitle(l.title());
                pl.setUrl(l.url());
                links.add(pl);
            }
            p.setLinks(links);
        }

        if (dto.media() != null) {
            var media = new ArrayList<ProjectMedia>();
            for (var m : dto.media()) {
                var pm = new ProjectMedia();
                pm.setImageUrl(m.imageUrl());
                pm.setAltText(m.altText());
                pm.setThumbnailUrl(m.thumbnailUrl());
                media.add(pm);
            }
            p.setMedia(media);
        }

        p.setOutcomeSummary(dto.outcomeSummary());
        p.setDownloadsCount(dto.downloadsCount());
        p.setUsersCount(dto.usersCount());
        p.setStarsCount(dto.starsCount());
        p.setRevenueImpactUsd(dto.revenueImpactUsd());

        p.setLicenseSpdx(dto.licenseSpdx());
        p.setLicenseUrl(dto.licenseUrl());

        Integer maxOrder = projectRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        p.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        p = projectRepository.save(p);
        return resumeMapper.toDto(p);
    }

    public ProjectResponseDto updateProject(Long projectId, ProjectUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var p = projectRepository.findByIdAndPersonalInfo_Id(projectId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This project does not belong to your profile."));

        if (dto.version() == null)
            throw new BadRequestException("Project version is required for update.");
        if (!dto.version().equals(p.getVersion()))
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for project id=" + projectId);

        if (dto.title() != null)
            p.setTitle(dto.title());
        if (dto.projectType() != null)
            p.setProjectType(parseProjectType(dto.projectType()));
        if (dto.role() != null)
            p.setRole(parseProjectRole(dto.role()));
        if (dto.shortDescription() != null)
            p.setShortDescription(dto.shortDescription());

        if (dto.startDate() != null)
            p.setStartDate(dto.startDate());
        if (dto.currentlyActive() != null)
            p.setCurrentlyActive(dto.currentlyActive());
        if (p.isCurrentlyActive())
            p.setEndDate(null);
        else if (dto.endDate() != null)
            p.setEndDate(dto.endDate());

        if (dto.technologies() != null)
            p.setTechnologies(new ArrayList<>(dto.technologies()));
        if (dto.features() != null)
            p.setFeatures(new ArrayList<>(dto.features()));

        if (dto.links() != null) {
            var links = new ArrayList<ProjectLink>();
            for (var l : dto.links()) {
                var pl = new ProjectLink();
                pl.setType(parseLinkType(l.type()));
                pl.setTitle(l.title());
                pl.setUrl(l.url());
                links.add(pl);
            }
            p.setLinks(links);
        }

        if (dto.media() != null) {
            var media = new ArrayList<ProjectMedia>();
            for (var m : dto.media()) {
                var pm = new ProjectMedia();
                pm.setImageUrl(m.imageUrl());
                pm.setAltText(m.altText());
                pm.setThumbnailUrl(m.thumbnailUrl());
                media.add(pm);
            }
            p.setMedia(media);
        }

        if (dto.outcomeSummary() != null)
            p.setOutcomeSummary(dto.outcomeSummary());
        if (dto.downloadsCount() != null)
            p.setDownloadsCount(dto.downloadsCount());
        if (dto.usersCount() != null)
            p.setUsersCount(dto.usersCount());
        if (dto.starsCount() != null)
            p.setStarsCount(dto.starsCount());
        if (dto.revenueImpactUsd() != null)
            p.setRevenueImpactUsd(dto.revenueImpactUsd());

        if (dto.licenseSpdx() != null)
            p.setLicenseSpdx(dto.licenseSpdx());
        if (dto.licenseUrl() != null)
            p.setLicenseUrl(dto.licenseUrl());

        p = projectRepository.save(p);
        return resumeMapper.toDto(p);
    }

    public void deleteProject(Long projectId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var p = projectRepository.findByIdAndPersonalInfo_Id(projectId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This project does not belong to your profile."));
        projectRepository.delete(p);
    }

    public void reorderProjects(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = projectRepository.findAllByPersonalInfo_Id(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match projects count.");
        }

        var byId = new HashMap<Long, PersonalInfoProjectEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Project not found in your profile: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        projectRepository.saveAll(items);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> listProjects() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var entities = projectRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfileProjectDtoList(entities);
    }

    @Transactional(readOnly = true)
    public ProjectResponseDto getProject(Long projectId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var p = projectRepository.findByIdAndPersonalInfo_Id(projectId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This project does not belong to your profile."));
        return resumeMapper.toDto(p);
    }

    private ProjectType parseProjectType(String v) {
        if (v == null || v.isBlank())
            return null;
        try {
            return ProjectType.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid projectType. Allowed: PERSONAL, ACADEMIC, OPEN_SOURCE, FREELANCE, COLLABORATIVE");
        }
    }

    private ProjectRole parseProjectRole(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return ProjectRole.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid role. Allowed: LEAD_DEV, DATA_SCIENTIST, PM, DESIGNER, ENGINEER, QA, DEVOPS, OTHER");
        }
    }

    private ProjectLinkType parseLinkType(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace('-', '_');
        try {
            return ProjectLinkType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            return ProjectLinkType.OTHER;
        }
    }
}