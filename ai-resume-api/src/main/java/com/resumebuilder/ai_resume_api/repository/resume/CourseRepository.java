package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    Optional<CourseEntity> findByIdAndResume_Id(Long id, Long resumeId);

    Optional<CourseEntity> findByIdAndResume_User_Username(Long id, String username);

    List<CourseEntity> findAllByResume_IdOrderByDisplayOrderAscIdAsc(Long resumeId);

    @Query("select coalesce(max(c.displayOrder), -1) from CourseEntity c where c.resume.id = :resumeId")
    Integer findMaxDisplayOrderByResume_Id(@Param("resumeId") Long resumeId);
}