package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReferenceRepository extends JpaRepository<ReferenceEntity, Long> {
    Optional<ReferenceEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<ReferenceEntity> findByIdAndResume_User_Username(Long id, String username);

    List<ReferenceEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(r.displayOrder), -1) from ReferenceEntity r where r.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}