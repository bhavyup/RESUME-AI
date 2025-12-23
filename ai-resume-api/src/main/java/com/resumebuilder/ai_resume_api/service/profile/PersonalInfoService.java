package com.resumebuilder.ai_resume_api.service.profile;

import com.resumebuilder.ai_resume_api.dto.CustomLinkDto;
import com.resumebuilder.ai_resume_api.dto.LanguageDto;
import com.resumebuilder.ai_resume_api.dto.PersonalInfoRequestDto;
import com.resumebuilder.ai_resume_api.entity.*;
import com.resumebuilder.ai_resume_api.entity.profile.*;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalInfoService {
    private final UserRepository userRepository;

    public PersonalInfoService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public PersonalInfoEntity createOrUpdatePersonalInfo(PersonalInfoRequestDto dto) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new UsernameNotFoundException("User not authenticated");
        }
        UserEntity user = userRepository.findById(up.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        final PersonalInfoEntity personalInfo;
        if (user.getPersonalInfo() == null) {
            PersonalInfoEntity pi = new PersonalInfoEntity();
            pi.setUser(user);
            user.setPersonalInfo(pi);
            personalInfo = pi;
        } else {
            personalInfo = user.getPersonalInfo();
        }

        personalInfo.setFullName(dto.fullName());
        personalInfo.setProfessionalTitle(dto.professionalTitle());
        personalInfo.setResumeHeadline(dto.resumeHeadline());
        personalInfo.setProfessionalSummary(dto.professionalSummary());
        personalInfo.setEmail(dto.email());
        personalInfo.setPhoneNumber(dto.phoneNumber());
        personalInfo.setCity(dto.city());
        personalInfo.setState(dto.state());
        personalInfo.setCountry(dto.country());
        personalInfo.setZip(dto.zip());
        personalInfo.setPreferredContactMethod(dto.preferredContactMethod());
        personalInfo.setLinkedinUrl(dto.linkedinUrl());
        personalInfo.setGithubUrl(dto.githubUrl());
        personalInfo.setWebsiteUrl(dto.websiteUrl());
        personalInfo.setTwitterUrl(dto.twitterUrl());
        personalInfo.setInstagramUrl(dto.instagramUrl());
        personalInfo.setTelegramUrl(dto.telegramUrl());
        personalInfo.setFacebookUrl(dto.facebookUrl());
        personalInfo.setWhatsappUrl(dto.whatsappUrl());
        personalInfo.setWorkPreference(dto.workPreference());
        personalInfo.setPhotoUrl(dto.photoUrl());
        personalInfo.setTargetRoles(dto.targetRoles() == null ? List.of() : dto.targetRoles());
        if (personalInfo.getVersion() == null) {
            personalInfo.setVersion(0L);
        } else {
            personalInfo.setVersion(personalInfo.getVersion() + 1);
        }

        createOrUpdateLanguages(personalInfo, dto.languages());
        createOrUpdateLinks(personalInfo, dto.links());

        return userRepository.save(user).getPersonalInfo();
    }

    private void createOrUpdateLanguages(PersonalInfoEntity personalInfo, List<LanguageDto> languages) {
        if (languages == null)
            languages = List.of();

        Map<Long, LanguageDto> dtoMap = languages.stream()
                .filter(l -> l.id() != null).collect(Collectors.toMap(LanguageDto::id, l -> l));

        if (personalInfo.getLanguages() == null) {
            personalInfo.setLanguages(new ArrayList<>());
        } else {
            personalInfo.getLanguages().removeIf(lang -> lang.getId() != null && !dtoMap.containsKey(lang.getId()));
        }

        for (var langDto : languages) {
            if (langDto.id() != null) {
                personalInfo.getLanguages().stream()
                        .filter(l -> l.getId().equals(langDto.id()))
                        .findFirst()
                        .ifPresent(l -> {
                            l.setLanguage(langDto.language());
                            l.setProficiencyLevel(langDto.proficiencyLevel());
                        });
            } else {
                personalInfo.getLanguages().add(new LanguageEntity(
                        null, langDto.language(), langDto.proficiencyLevel(), personalInfo));
            }
        }
    }

    private void createOrUpdateLinks(PersonalInfoEntity personalInfo, List<CustomLinkDto> links) {
        if (links == null)
            links = List.of();

        Map<Long, CustomLinkDto> dtoMap = links.stream()
                .filter(l -> l.id() != null).collect(Collectors.toMap(CustomLinkDto::id, l -> l));

        if (personalInfo.getLinks() == null) {
            personalInfo.setLinks(new ArrayList<>());
        } else {
            personalInfo.getLinks().removeIf(link -> link.getId() != null && !dtoMap.containsKey(link.getId()));
        }

        for (var linkDto : links) {
            if (linkDto.id() != null) {
                personalInfo.getLinks().stream()
                        .filter(l -> l.getId().equals(linkDto.id()))
                        .findFirst()
                        .ifPresent(l -> {
                            l.setTitle(linkDto.title());
                            l.setUrl(linkDto.url());
                        });
            } else {
                personalInfo.getLinks().add(new CustomLinkEntity(
                        null, linkDto.title(), linkDto.url(), personalInfo));
            }
        }
    }

    @Transactional(readOnly = true)
    public PersonalInfoEntity getPersonalInfo() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new UsernameNotFoundException("User not authenticated");
        }

        UserEntity user = userRepository.findById(up.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return user.getPersonalInfo(); // May be null if not yet created
    }
}