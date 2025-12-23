package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatentRepository extends JpaRepository<PatentEntity, Long> {
    Optional<PatentEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<PatentEntity> findByIdAndResume_User_Username(Long id, String username);

    List<PatentEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(p.displayOrder), -1) from PatentEntity p where p.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}