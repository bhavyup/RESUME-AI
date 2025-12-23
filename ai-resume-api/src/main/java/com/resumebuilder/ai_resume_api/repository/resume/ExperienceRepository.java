package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.ExperienceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface ExperienceRepository extends JpaRepository<ExperienceEntity, Long> {

    Optional<ExperienceEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<ExperienceEntity> findByIdAndResume_User_Username(Long id, String username);

    long deleteByIdAndResume_User_Username(Long id, String username);

    List<ExperienceEntity> findAllByResume_Id(Long resumeId);

    @Query("select coalesce(max(e.displayOrder), -1) from ExperienceEntity e where e.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);

    List<ExperienceEntity> findAllByResume_IdOrderByDisplayOrderAscStartDateDescIdAsc(Long resumeId);
}