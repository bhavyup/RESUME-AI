package com.resumebuilder.ai_resume_api.repository;

import com.resumebuilder.ai_resume_api.entity.PaymentHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistoryEntity, Long> {

    List<PaymentHistoryEntity> findByUserIdOrderByPaymentDateDesc(Long userId);

    Page<PaymentHistoryEntity> findByUserIdOrderByPaymentDateDesc(Long userId, Pageable pageable);

    Optional<PaymentHistoryEntity> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<PaymentHistoryEntity> findBySubscriptionIdOrderByPaymentDateDesc(Long subscriptionId);
}