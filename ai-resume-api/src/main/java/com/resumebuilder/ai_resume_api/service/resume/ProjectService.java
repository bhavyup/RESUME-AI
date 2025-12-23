package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ProjectRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ProjectUpdateDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectLink;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectMedia;
import com.resumebuilder.ai_resume_api.enums.ProjectLinkType;
import com.resumebuilder.ai_resume_api.enums.ProjectRole;
import com.resumebuilder.ai_resume_api.enums.ProjectType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.resume.ProjectRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;

    public ProjectService(ProjectRepository projectRepository, ResumeRepository resumeRepository,
            ResumeMapper resumeMapper) {
        this.projectRepository = projectRepository;
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
    }

    public ProjectResponseDto createProject(Long resumeId, ProjectRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (dto.title() == null || dto.title().isBlank()) {
            throw new BadRequestException("Project title is required");
        }

        var p = new ProjectEntity();
        p.setResume(resume);

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

        Integer maxOrder = projectRepository.findMaxDisplayOrderByResume_Id(resume.getId());
        p.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        p = projectRepository.save(p);
        return resumeMapper.toDto(p);
    }

    public ProjectResponseDto updateProject(Long resumeId, Long projectId, ProjectUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        var p = projectRepository.findByIdAndResume_Id(projectId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The project does not belong to the specified resume."));

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

    public void deleteProject(Long resumeId, Long projectId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        var p = projectRepository.findByIdAndResume_Id(projectId, resume.getId())
                .orElseThrow(() -> new AccessDeniedException("The project does not belong to the specified resume."));
        projectRepository.delete(p);
    }

    public void reorderProjects(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(resume.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during project reorder.");
        }

        var items = projectRepository.findAllByResume_Id(resume.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match projects count.");
        }

        var byId = new java.util.HashMap<Long, ProjectEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Project not found in this resume: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        projectRepository.saveAll(items);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<com.resumebuilder.ai_resume_api.dto.resume.ProjectResponseDto> listProjects(Long resumeId) {
        String username = com.resumebuilder.ai_resume_api.security.SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("Resume not found"));

        var entities = projectRepository.findAllByResume_IdOrderByDisplayOrderAscIdAsc(resume.getId());
        return resumeMapper.toProjectDtoList(entities);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.resumebuilder.ai_resume_api.dto.resume.ProjectResponseDto getProject(Long resumeId, Long projectId) {
        String username = com.resumebuilder.ai_resume_api.security.SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("Resume not found"));

        var p = projectRepository.findByIdAndResume_Id(projectId, resume.getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                        "The project does not belong to the specified resume."));
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