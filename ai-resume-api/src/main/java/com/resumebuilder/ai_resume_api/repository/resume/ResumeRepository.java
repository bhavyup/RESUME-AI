package com.resumebuilder.ai_resume_api.repository.resume;

import com.resumebuilder.ai_resume_api.entity.resume.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.resumebuilder.ai_resume_api.enums.ResumeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<ResumeEntity, Long> {

    // Owner-scoped listings
    List<ResumeEntity> findAllByUser_UsernameOrderByUpdatedAtDesc(String username);

    Page<ResumeEntity> findAllByUser_UsernameOrderByUpdatedAtDesc(String username, Pageable pageable);

    // Owner-scoped fetch
    Optional<ResumeEntity> findByIdAndUser_Username(Long id, String username);

    // Safe deletion (returns number of rows deleted)
    long deleteByIdAndUser_Username(Long id, String username);

    long countByUserIdAndResumeType(Long userId, ResumeType resumeType);

    @Query("SELECT COUNT(r) FROM ResumeEntity r WHERE r.user.id = :userId AND r.resumeType = :type")
    long countResumesByType(@Param("userId") Long userId, @Param("type") ResumeType type);
}