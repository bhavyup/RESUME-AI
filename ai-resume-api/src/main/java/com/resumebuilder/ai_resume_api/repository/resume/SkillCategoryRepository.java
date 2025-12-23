package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SkillCategoryRepository extends JpaRepository<SkillCategoryEntity, Long> {

    Optional<SkillCategoryEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<SkillCategoryEntity> findByIdAndResume_User_Username(Long id, String username);

    boolean existsByResume_IdAndNameIgnoreCase(Long resumeId, String name);

    long deleteByIdAndResume_User_Username(Long id, String username);

    java.util.List<com.resumebuilder.ai_resume_api.entity.resume.SkillCategoryEntity> findAllByResume_Id(Long resumeId);

    @Query("select coalesce(max(c.displayOrder), -1) from SkillCategoryEntity c where c.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);

    java.util.List<SkillCategoryEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);
}