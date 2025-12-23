package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoSkillCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoSkillCategoryRepository extends JpaRepository<PersonalInfoSkillCategoryEntity, Long> {

    Optional<PersonalInfoSkillCategoryEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    boolean existsByPersonalInfo_IdAndNameIgnoreCase(Long personalInfoId, String name);

    List<PersonalInfoSkillCategoryEntity> findAllByPersonalInfo_Id(Long personalInfoId);

    @Query("select coalesce(max(c.displayOrder), -1) from PersonalInfoSkillCategoryEntity c where c.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);

    List<PersonalInfoSkillCategoryEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);
}