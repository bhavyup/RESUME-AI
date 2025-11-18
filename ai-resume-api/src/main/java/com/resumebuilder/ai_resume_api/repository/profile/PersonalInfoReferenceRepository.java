package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoReferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoReferenceRepository extends JpaRepository<PersonalInfoReferenceEntity, Long> {

    Optional<PersonalInfoReferenceEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoReferenceEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);

    @Query("select coalesce(max(r.displayOrder), -1) from PersonalInfoReferenceEntity r where r.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);
}