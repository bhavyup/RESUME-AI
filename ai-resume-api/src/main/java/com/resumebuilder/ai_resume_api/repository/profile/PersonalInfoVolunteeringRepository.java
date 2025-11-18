package com.resumebuilder.ai_resume_api.repository.profile;

import com.resumebuilder.ai_resume_api.entity.profile.PersonalInfoVolunteeringEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalInfoVolunteeringRepository extends JpaRepository<PersonalInfoVolunteeringEntity, Long> {

    Optional<PersonalInfoVolunteeringEntity> findByIdAndPersonalInfo_Id(Long id, Long personalInfoId);

    List<PersonalInfoVolunteeringEntity> findAllByPersonalInfo_IdOrderByDisplayOrderAscIdAsc(Long personalInfoId);

    @Query("select coalesce(max(v.displayOrder), -1) from PersonalInfoVolunteeringEntity v where v.personalInfo.id = :personalInfoId")
    Integer findMaxDisplayOrderByPersonalInfo_Id(@Param("personalInfoId") Long personalInfoId);
}