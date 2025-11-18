package com.resumebuilder.ai_resume_api.service.resume;

import com.resumebuilder.ai_resume_api.dto.resume.ResumeRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.ResumeResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.ResumeSummaryDto;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.enums.ResumeType;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import com.resumebuilder.ai_resume_api.service.FeatureGateService;
import com.resumebuilder.ai_resume_api.service.TailorPlanCacheService;
import com.resumebuilder.ai_resume_api.service.UsageTrackingService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;
    private final FeatureGateService featureGateService;
    @SuppressWarnings("unused")
    private final UsageTrackingService usageTrackingService;
    private final TailorPlanCacheService tailorPlanCache;
    private final com.resumebuilder.ai_resume_api.service.ai.TailoringService tailoringService;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository, ResumeMapper resumeMapper,
            FeatureGateService featureGateService, UsageTrackingService usageTrackingService,
            TailorPlanCacheService tailorPlanCache,
            com.resumebuilder.ai_resume_api.service.ai.TailoringService tailoringService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
        this.featureGateService = featureGateService;
        this.usageTrackingService = usageTrackingService;
        this.tailorPlanCache = tailorPlanCache;
        this.tailoringService = tailoringService;
    }

    public ResumeResponseDto createResume(ResumeRequestDto requestDto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));

        // ENFORCE LIMITS based on resume type
        ResumeType resumeType = requestDto.resumeType() != null
                ? parseResumeType(requestDto.resumeType())
                : ResumeType.BASE;

        if (resumeType == ResumeType.BASE) {
            featureGateService.checkCanCreateBaseResume(user);
        } else {
            featureGateService.checkCanCreateTailoredResume(user);
        }

        var r = new ResumeEntity();
        r.setUser(user);
        r.setResumeType(resumeType);
        r.setTitle(requestDto.title());
        r.setSkillProficiencyType(parseSkillType(requestDto.skillProficiencyType()));

        // Set job description if tailored
        if (resumeType == ResumeType.TAILORED && requestDto.jobDescription() != null) {
            r.setJobDescription(requestDto.jobDescription());
        }

        // Set base resume reference if tailored
        if (resumeType == ResumeType.TAILORED && requestDto.baseResumeId() != null) {
            var baseResume = resumeRepository.findById(requestDto.baseResumeId())
                    .orElseThrow(() -> new NotFoundException("Base resume not found: " + requestDto.baseResumeId()));
            r.setBaseResume(baseResume);
        }

        r.setFullName(requestDto.customFullName());
        r.setEmail(requestDto.customEmail());
        r.setPhoneNumber(requestDto.customPhoneNumber());
        r.setCity(requestDto.customCity());
        r.setCountry(requestDto.customCountry());
        r.setState(requestDto.customState());
        r.setZip(requestDto.customZip());
        r.setLinkedinUrl(requestDto.customLinkedinUrl());
        r.setGithubUrl(requestDto.customGithubUrl());
        r.setTwitterUrl(requestDto.customTwitterUrl());
        r.setFacebookUrl(requestDto.customFacebookUrl());
        r.setWhatsappUrl(requestDto.customWhatsappUrl());
        r.setInstagramUrl(requestDto.customInstagramUrl());
        r.setTelegramUrl(requestDto.customTelegramUrl());
        r.setWebsiteUrl(requestDto.customWebsiteUrl());
        r.setResumeHeadline(requestDto.customResumeHeadline());
        r.setPreferredContactMethod(requestDto.customPreferredContactMethod());
        r.setWorkPreference(requestDto.customWorkPreference());
        r.setPhotoUrl(requestDto.customPhotoUrl());
        r.setTargetRoles(requestDto.customTargetRoles() != null ? new ArrayList<>(requestDto.customTargetRoles())
                : new ArrayList<>());
        r.setProfessionalSummary(requestDto.customProfessionalSummary());

        if (requestDto.customLanguages() != null) {
            int idx = 0;
            for (var lang : requestDto.customLanguages()) {
                var e = new ResumeLanguageEntity();
                e.setLanguageName(lang.languageName());
                e.setProficiency(parseLangProf(lang.proficiency()));
                e.setResume(r);
                e.setDisplayOrder(idx++);
                r.getLanguages().add(e);
            }
        }
        if (requestDto.customLinks() != null) {
            int idx = 0;
            for (var link : requestDto.customLinks()) {
                var e = new ResumeCustomLinkEntity();
                e.setTitle(link.title());
                e.setUrl(link.url());
                e.setResume(r);
                e.setDisplayOrder(idx++);
                r.getLinks().add(e);
            }
        }

        r = resumeRepository.save(r);
        return resumeMapper.toResponseDto(r);
    }

    // Add helper method to parse resume type
    private ResumeType parseResumeType(String v) {
        if (v == null || v.isBlank()) {
            return ResumeType.BASE;
        }
        String key = v.trim().toUpperCase();
        try {
            return ResumeType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Invalid resume type: " + v + ". Allowed: BASE, TAILORED");
        }
    }

    public ResumeResponseDto updateResume(Long resumeId,
            com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var r = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (dto.version() == null) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Resume version is required for update.");
        }
        if (!dto.version().equals(r.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume. Please refresh and retry.");
        }

        // Scalars (PUT semantics: null clears)
        r.setTitle(dto.title());
        if (dto.skillProficiencyType() != null) {
            r.setSkillProficiencyType(parseSkillType(dto.skillProficiencyType()));
        }

        r.setFullName(dto.customFullName());
        r.setEmail(dto.customEmail());
        r.setPhoneNumber(dto.customPhoneNumber());
        r.setCity(dto.customCity());
        r.setCountry(dto.customCountry());
        r.setState(dto.customState());
        r.setZip(dto.customZip());
        r.setLinkedinUrl(dto.customLinkedinUrl());
        r.setGithubUrl(dto.customGithubUrl());
        r.setTwitterUrl(dto.customTwitterUrl());
        r.setFacebookUrl(dto.customFacebookUrl());
        r.setWhatsappUrl(dto.customWhatsappUrl());
        r.setInstagramUrl(dto.customInstagramUrl());
        r.setTelegramUrl(dto.customTelegramUrl());
        r.setWebsiteUrl(dto.customWebsiteUrl());
        r.setResumeHeadline(dto.customResumeHeadline());
        r.setPreferredContactMethod(dto.customPreferredContactMethod());
        r.setWorkPreference(dto.customWorkPreference());
        r.setPhotoUrl(dto.customPhotoUrl());
        r.setTargetRoles(
                dto.customTargetRoles() != null ? new ArrayList<>(dto.customTargetRoles()) : new ArrayList<>());
        r.setProfessionalSummary(dto.customProfessionalSummary());

        upsertLanguages(r, dto);
        upsertLinks(r, dto);

        r = resumeRepository.save(r);
        return resumeMapper.toResponseDto(r);
    }

    private void upsertLanguages(ResumeEntity r, com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto dto) {
        if (dto.customLanguages() == null)
            return;

        if (r.getLanguages() == null)
            r.setLanguages(new ArrayList<>());

        // Map existing by id for fast lookup
        Map<Long, ResumeLanguageEntity> existingById = new HashMap<>();
        for (var e : r.getLanguages()) {
            if (e.getId() != null)
                existingById.put(e.getId(), e);
        }

        // Filter to DTOs that represent existing records
        Map<Long, com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto.LanguageUpdateDto> dtoById = new HashMap<>();
        dto.customLanguages().stream().filter(l -> l.id() != null).forEach(l -> dtoById.put(l.id(), l));

        // Remove existing entities not present in DTO (treat list as source of truth)
        r.getLanguages().removeIf(e -> e.getId() != null && !dtoById.containsKey(e.getId()));

        // Upsert
        for (var lang : dto.customLanguages()) {
            if (lang.id() != null) {
                var e = existingById.get(lang.id());
                if (e == null) {
                    throw new NotFoundException("Language not found in this resume: id=" + lang.id());
                }
                if (lang.version() == null) {
                    throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                            "Language version is required for update (id=" + lang.id() + ").");
                }
                if (!lang.version().equals(e.getVersion())) {
                    throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                            "Version mismatch for language id=" + lang.id());
                }
                e.setLanguageName(lang.languageName());
                e.setProficiency(parseLangProf(lang.proficiency()));
            } else {
                var e = new ResumeLanguageEntity();
                e.setLanguageName(lang.languageName());
                e.setProficiency(parseLangProf(lang.proficiency()));
                e.setResume(r);
                e.setDisplayOrder(r.getLanguages().size()); // append to end
                r.getLanguages().add(e);
            }
        }
    }

    private void upsertLinks(ResumeEntity r, com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto dto) {
        if (dto.customLinks() == null)
            return;

        if (r.getLinks() == null)
            r.setLinks(new ArrayList<>());

        Map<Long, ResumeCustomLinkEntity> existingById = new HashMap<>();
        for (var e : r.getLinks()) {
            if (e.getId() != null)
                existingById.put(e.getId(), e);
        }

        Map<Long, com.resumebuilder.ai_resume_api.dto.resume.ResumeUpdateDto.CustomLinkUpdateDto> dtoById = new HashMap<>();
        dto.customLinks().stream().filter(l -> l.id() != null).forEach(l -> dtoById.put(l.id(), l));

        r.getLinks().removeIf(e -> e.getId() != null && !dtoById.containsKey(e.getId()));

        for (var link : dto.customLinks()) {
            if (link.id() != null) {
                var e = existingById.get(link.id());
                if (e == null) {
                    throw new NotFoundException("Custom link not found in this resume: id=" + link.id());
                }
                if (link.version() == null) {
                    throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                            "Custom link version is required for update (id=" + link.id() + ").");
                }
                if (!link.version().equals(e.getVersion())) {
                    throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                            "Version mismatch for custom link id=" + link.id());
                }
                e.setTitle(link.title());
                e.setUrl(link.url());
            } else {
                var e = new ResumeCustomLinkEntity();
                e.setTitle(link.title());
                e.setUrl(link.url());
                e.setResume(r);
                e.setDisplayOrder(r.getLinks().size()); // append to end
                r.getLinks().add(e);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ResumeSummaryDto> listMyResumes() {
        String username = SecurityUtil.currentUsername();
        var list = resumeRepository.findAllByUser_UsernameOrderByUpdatedAtDesc(username);
        return resumeMapper.toSummaryList(list);
    }

    @Transactional(readOnly = true)
    public ResumeResponseDto getMyResume(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var r = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        return resumeMapper.toResponseDto(r);
    }

    public void deleteMyResume(Long resumeId) {
        String username = SecurityUtil.currentUsername();
        var resume = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));
        // Deleting the managed entity ensures cascades/orphanRemoval and entity
        // callbacks apply
        resumeRepository.delete(resume);
    }

    public void reorderLanguages(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var r = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(r.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during language reorder.");
        }

        var items = r.getLanguages(); // lazy-load within TX
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match languages count.");
        }

        var byId = new java.util.HashMap<Long, ResumeLanguageEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Language not found in this resume: id=" + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        resumeRepository.save(r); // Cascade persists child updates
    }

    public void reorderLinks(Long resumeId, com.resumebuilder.ai_resume_api.dto.ReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var r = resumeRepository.findByIdAndUser_Username(resumeId, username)
                .orElseThrow(() -> new NotFoundException("Resume not found"));

        if (!req.resumeVersion().equals(r.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for resume during link reorder.");
        }

        var items = r.getLinks();
        if (items.size() != req.orderedIds().size()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "orderedIds size must match links count.");
        }

        var byId = new java.util.HashMap<Long, ResumeCustomLinkEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new java.util.HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id)) {
                throw new NotFoundException("Link not found in this resume: id=" + id);
            }
            if (!seen.add(id)) {
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Duplicate id in orderedIds: " + id);
            }
            byId.get(id).setDisplayOrder(pos++);
        }

        resumeRepository.save(r);
    }

    private com.resumebuilder.ai_resume_api.enums.SkillProficiencyType parseSkillType(String v) {
        if (v == null || v.isBlank())
            return com.resumebuilder.ai_resume_api.enums.SkillProficiencyType.NUMERIC;
        String key = v.trim().toUpperCase();
        // Optional synonym mapping
        if (key.equals("TEXT"))
            key = "STRING";
        if (key.equals("ALPHA") || key.equals("VERBAL"))
            key = "STRING";
        if (key.equals("INT") || key.equals("INTEGER"))
            key = "NUMERIC"; // legacy

        switch (key) {
            case "NUMERIC":
                return com.resumebuilder.ai_resume_api.enums.SkillProficiencyType.NUMERIC;
            case "STRING":
                return com.resumebuilder.ai_resume_api.enums.SkillProficiencyType.STRING;
            default:
                throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                        "Invalid skillProficiencyType. Allowed: NUMERIC, STRING");
        }
    }

    private com.resumebuilder.ai_resume_api.enums.LanguageProficiency parseLangProf(String v) {
        if (v == null || v.isBlank())
            return com.resumebuilder.ai_resume_api.enums.LanguageProficiency.PROFESSIONAL_WORKING;
        String key = v.trim().toUpperCase().replaceAll("[^A-Z]+", "_");
        if (key.equals("FLUENT"))
            key = "FULL_PROFESSIONAL";
        if (key.equals("NATIVE_OR_BILINGUAL") || key.equals("BILINGUAL"))
            key = "NATIVE";
        if (key.equals("WORKING_PROFESSIONAL"))
            key = "PROFESSIONAL_WORKING";
        if (key.equals("LIMITED"))
            key = "LIMITED_WORKING";
        if (key.equals("BEGINNER"))
            key = "ELEMENTARY";
        try {
            return com.resumebuilder.ai_resume_api.enums.LanguageProficiency.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Invalid language proficiency: " + v +
                            ". Allowed: ELEMENTARY, LIMITED_WORKING, PROFESSIONAL_WORKING, FULL_PROFESSIONAL, NATIVE");
        }
    }
}