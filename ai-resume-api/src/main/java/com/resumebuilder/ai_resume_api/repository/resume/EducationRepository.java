package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.EducationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface EducationRepository extends JpaRepository<EducationEntity, Long> {

    Optional<EducationEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<EducationEntity> findByIdAndResume_User_Username(Long id, String username);

    long deleteByIdAndResume_User_Username(Long id, String username);

    List<EducationEntity> findAllByResume_Id(Long resumeId);

    @Query("select coalesce(max(e.displayOrder), -1) from EducationEntity e where e.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);

    List<EducationEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(
            Long resumeId);
}