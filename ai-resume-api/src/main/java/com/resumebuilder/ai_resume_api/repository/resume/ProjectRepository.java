package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    Optional<ProjectEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<ProjectEntity> findByIdAndResume_User_Username(Long id, String username);

    List<ProjectEntity> findAllByResume_Id(Long resumeId);

    @Query("select coalesce(max(p.displayOrder), -1) from ProjectEntity p where p.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);

    List<ProjectEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(
            Long resumeId);
}