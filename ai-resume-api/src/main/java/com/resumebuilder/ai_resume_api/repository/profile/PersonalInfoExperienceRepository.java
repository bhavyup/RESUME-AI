package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoExperienceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoExperienceRepository extends JpaRepository<PersonalInfoExperienceEntity, Long> {

    Optional<PersonalInfoExperienceEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoExperienceEntity> findAllByPersonalInfo_Id(Long personalInfoId);

    @Query("select coalesce(max(e.displayOrder), -1) from PersonalInfoExperienceEntity e where e.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);

    List<PersonalInfoExperienceEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscStartDateDescIdAsc(
            Long personalInfoId);
}