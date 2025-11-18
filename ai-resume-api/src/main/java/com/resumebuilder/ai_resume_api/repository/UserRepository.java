package com.resumebuilder.ai_resume_api.repository;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    @EntityGraph(attributePaths = {
            "personalInfo" })
    Optional<UserEntity> findWithPersonalInfoById(Long id);

    List<UserEntity> findByAccountNonLockedFalseAndLockedUntilBefore(java.time.Instant now);
}