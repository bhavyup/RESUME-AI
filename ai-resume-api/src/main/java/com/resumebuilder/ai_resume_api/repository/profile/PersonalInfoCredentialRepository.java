package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoCredentialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoCredentialRepository extends JpaRepository<PersonalInfoCredentialEntity, Long> {

    Optional<PersonalInfoCredentialEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoCredentialEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);

    @Query("select coalesce(max(c.displayOrder), -1) from PersonalInfoCredentialEntity c where c.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);
}