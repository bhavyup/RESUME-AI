package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<SkillEntity, Long> {

    Optional<SkillEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<SkillEntity> findByIdAndResume_User_Username(Long id, String username);

    List<SkillEntity> findAllByResume_Id(Long resumeId);

    long deleteByIdAndResume_User_Username(Long id, String username);

    @Query("select coalesce(max(s.displayOrder), -1) from SkillEntity s where s.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);

    List<SkillEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);
}