package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TalkRepository extends JpaRepository<TalkEntity, Long> {
    Optional<TalkEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<TalkEntity> findByIdAndResume_User_Username(Long id, String username);

    List<TalkEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(t.displayOrder), -1) from TalkEntity t where t.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}