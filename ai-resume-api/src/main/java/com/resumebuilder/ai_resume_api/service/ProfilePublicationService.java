package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ProfileReorderRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationRequestDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationResponseDto;
import com.resumebuilder.ai_resume_api.dto.resume.PublicationUpdateDto;
import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoPublicationEntity;
import com.resumebuilder.ai_resume_api.enums.PublicationStatus;
import com.resumebuilder.ai_resume_api.enums.PublicationType;
import com.resumebuilder.ai_resume_api.enums.PresentationType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.mapper.ResumeMapper;
import com.resumebuilder.ai_resume_api.repository.profile.PersonalInfoPublicationRepository;
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
public class ProfilePublicationService {

    private final PersonalInfoPublicationRepository publicationRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    public ProfilePublicationService(PersonalInfoPublicationRepository publicationRepository,
            UserRepository userRepository,
            ResumeMapper resumeMapper) {
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
        this.resumeMapper = resumeMapper;
    }

    @Transactional(readOnly = true)
    public List<PublicationResponseDto> list() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var list = publicationRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        return resumeMapper.toProfilePublicationDtoList(list);
    }

    @Transactional(readOnly = true)
    public PublicationResponseDto getOne(Long publicationId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = publicationRepository.findByIdAndPersonalInfo_Id(publicationId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This publication does not belong to your profile."));
        return resumeMapper.toDto(e);
    }

    public PublicationResponseDto create(PublicationRequestDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found. Please create your profile first.");
        }

        var e = new PersonalInfoPublicationEntity();
        e.setPersonalInfo(personalInfo);

        e.setTitle(dto.title());
        e.setPublicationType(parseType(dto.publicationType()));
        e.setStatus(parseStatus(dto.status()));
        e.setVenue(dto.venue());
        e.setPublisher(dto.publisher());
        e.setDateYearMonth(dto.dateYearMonth());
        e.setPeerReviewed(Boolean.TRUE.equals(dto.peerReviewed()));

        e.setDoi(dto.doi());
        e.setArxivId(dto.arxivId());
        e.setSsrnId(dto.ssrnId());
        e.setPubmedId(dto.pubmedId());
        e.setIsbn(dto.isbn());
        e.setUrl(dto.url());

        e.setAbstractText(dto.abstractText());
        e.setSummary(dto.summary());
        e.setCitationCount(dto.citationCount());

        e.setPresentationTitle(dto.presentationTitle());
        e.setPresentationType(parsePresentation(dto.presentationType()));
        e.setEventName(dto.eventName());
        e.setEventLocationCity(dto.eventLocationCity());
        e.setEventLocationCountry(dto.eventLocationCountry());
        e.setPresentationDate(dto.presentationDate());

        e.setVolume(dto.volume());
        e.setIssue(dto.issue());
        e.setPages(dto.pages());

        if (dto.authors() != null)
            e.setAuthors(new ArrayList<>(dto.authors()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));

        Integer maxOrder = publicationRepository.findMaxDisplayOrderByPersonalInfo_Id(personalInfo.getId());
        e.setDisplayOrder((maxOrder == null ? -1 : maxOrder) + 1);

        e = publicationRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public PublicationResponseDto update(Long publicationId, PublicationUpdateDto dto) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = publicationRepository.findByIdAndPersonalInfo_Id(publicationId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This publication does not belong to your profile."));

        if (dto.version() == null)
            throw new BadRequestException("Publication version is required for update.");
        if (!dto.version().equals(e.getVersion())) {
            throw new com.resumebuilder.ai_resume_api.exception.OptimisticLockingException(
                    "Version mismatch for publication id=" + publicationId);
        }

        if (dto.title() != null)
            e.setTitle(dto.title());
        if (dto.publicationType() != null)
            e.setPublicationType(parseType(dto.publicationType()));
        if (dto.status() != null)
            e.setStatus(parseStatus(dto.status()));
        if (dto.venue() != null)
            e.setVenue(dto.venue());
        if (dto.publisher() != null)
            e.setPublisher(dto.publisher());
        if (dto.dateYearMonth() != null)
            e.setDateYearMonth(dto.dateYearMonth());
        if (dto.peerReviewed() != null)
            e.setPeerReviewed(dto.peerReviewed());

        if (dto.doi() != null)
            e.setDoi(dto.doi());
        if (dto.arxivId() != null)
            e.setArxivId(dto.arxivId());
        if (dto.ssrnId() != null)
            e.setSsrnId(dto.ssrnId());
        if (dto.pubmedId() != null)
            e.setPubmedId(dto.pubmedId());
        if (dto.isbn() != null)
            e.setIsbn(dto.isbn());
        if (dto.url() != null)
            e.setUrl(dto.url());

        if (dto.abstractText() != null)
            e.setAbstractText(dto.abstractText());
        if (dto.summary() != null)
            e.setSummary(dto.summary());
        if (dto.citationCount() != null)
            e.setCitationCount(dto.citationCount());

        if (dto.presentationTitle() != null)
            e.setPresentationTitle(dto.presentationTitle());
        if (dto.presentationType() != null)
            e.setPresentationType(parsePresentation(dto.presentationType()));
        if (dto.eventName() != null)
            e.setEventName(dto.eventName());
        if (dto.eventLocationCity() != null)
            e.setEventLocationCity(dto.eventLocationCity());
        if (dto.eventLocationCountry() != null)
            e.setEventLocationCountry(dto.eventLocationCountry());
        if (dto.presentationDate() != null)
            e.setPresentationDate(dto.presentationDate());

        if (dto.volume() != null)
            e.setVolume(dto.volume());
        if (dto.issue() != null)
            e.setIssue(dto.issue());
        if (dto.pages() != null)
            e.setPages(dto.pages());

        if (dto.authors() != null)
            e.setAuthors(new ArrayList<>(dto.authors()));
        if (dto.keywords() != null)
            e.setKeywords(new ArrayList<>(dto.keywords()));

        e = publicationRepository.save(e);
        return resumeMapper.toDto(e);
    }

    public void delete(Long publicationId) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var e = publicationRepository.findByIdAndPersonalInfo_Id(publicationId, personalInfo.getId())
                .orElseThrow(() -> new AccessDeniedException("This publication does not belong to your profile."));
        publicationRepository.delete(e);
    }

    public void reorder(ProfileReorderRequestDto req) {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
        var personalInfo = user.getPersonalInfo();
        if (personalInfo == null) {
            throw new NotFoundException("Personal info not found");
        }

        var items = publicationRepository.findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(personalInfo.getId());
        if (items.size() != req.orderedIds().size()) {
            throw new BadRequestException("orderedIds size must match publications count.");
        }

        var byId = new HashMap<Long, PersonalInfoPublicationEntity>();
        for (var it : items)
            byId.put(it.getId(), it);

        var seen = new HashSet<Long>();
        int pos = 0;
        for (var id : req.orderedIds()) {
            if (!byId.containsKey(id))
                throw new NotFoundException("Publication not found in your profile: id=" + id);
            if (!seen.add(id))
                throw new BadRequestException("Duplicate id in orderedIds: " + id);
            byId.get(id).setDisplayOrder(pos++);
        }

        publicationRepository.saveAll(items);
    }

    private PublicationType parseType(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return PublicationType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid publicationType. Allowed: JOURNAL, CONFERENCE, PREPRINT, BOOK, CHAPTER, ARTICLE, PATENT, THESIS, REPORT, OTHER");
        }
    }

    private PublicationStatus parseStatus(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return PublicationStatus.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid status. Allowed: PUBLISHED, ACCEPTED, IN_REVIEW, SUBMITTED, DRAFT, REJECTED");
        }
    }

    private PresentationType parsePresentation(String v) {
        if (v == null || v.isBlank())
            return null;
        String key = v.trim().toUpperCase().replace(' ', '_');
        try {
            return PresentationType.valueOf(key);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid presentationType. Allowed: TALK, POSTER, KEYNOTE");
        }
    }
}