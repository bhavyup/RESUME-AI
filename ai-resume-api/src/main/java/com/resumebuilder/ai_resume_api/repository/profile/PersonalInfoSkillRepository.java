package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoSkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoSkillRepository extends JpaRepository<PersonalInfoSkillEntity, Long> {

    Optional<PersonalInfoSkillEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoSkillEntity> findAllByPersonalInfo_Id(Long personalInfoId);

    @Query("select coalesce(max(s.displayOrder), -1) from PersonalInfoSkillEntity s where s.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);

    List<PersonalInfoSkillEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);
}