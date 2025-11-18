package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoEducationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoEducationRepository extends JpaRepository<PersonalInfoEducationEntity, Long> {

    Optional<PersonalInfoEducationEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoEducationEntity> findAllByPersonalInfo_Id(Long personalInfoId);

    @Query("select coalesce(max(e.displayOrder), -1) from PersonalInfoEducationEntity e where e.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);

    List<PersonalInfoEducationEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);
}