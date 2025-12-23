package com.resumebuilder.ai_resume_api.mapper;

import com.resumebuilder.ai_resume_api.dto.*;
import com.resumebuilder.ai_resume_api.entity.*;
import com.resumebuilder.ai_resume_api.entity.profile.*;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", config = MapStructCentralConfig.class)
public interface UserMapper {
    UserResponseDto toDto(UserEntity user);

    @Mapping(target = "personalInfo", source = "personalInfo")
    UserInfoResponseDto toInfoDto(UserEntity user);

    @Mapping(target = "languages", source = "languages")
    @Mapping(target = "links", source = "links")
    PersonalInfoDto toDto(PersonalInfoEntity personalInfo);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "language", source = "language")
    @Mapping(target = "proficiencyLevel", source = "proficiencyLevel")
    LanguageDto toLanguageDto(LanguageEntity lang);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "url", source = "url")
    CustomLinkDto toCustomLinkDto(CustomLinkEntity link);
}