package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoProjectRepository extends JpaRepository<PersonalInfoProjectEntity, Long> {

    Optional<PersonalInfoProjectEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoProjectEntity> findAllByPersonalInfo_Id(Long personalInfoId);

    @Query("select coalesce(max(p.displayOrder), -1) from PersonalInfoProjectEntity p where p.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);

    List<PersonalInfoProjectEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);
}