package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VolunteeringRepository extends JpaRepository<VolunteeringEntity, Long> {
    Optional<VolunteeringEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<VolunteeringEntity> findByIdAndResume_User_Username(Long id, String username);

    List<VolunteeringEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(v.displayOrder), -1) from VolunteeringEntity v where v.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}