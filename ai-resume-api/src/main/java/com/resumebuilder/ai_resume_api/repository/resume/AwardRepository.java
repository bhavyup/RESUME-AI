package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.AwardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AwardRepository extends JpaRepository<AwardEntity, Long> {

    Optional<AwardEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<AwardEntity> findByIdAndResume_User_Username(Long id, String username);

    List<AwardEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(a.displayOrder), -1) from AwardEntity a where a.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}