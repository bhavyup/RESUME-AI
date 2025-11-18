package com.resumebuilder.ai_resume_api.mapper;

import com.resumebuilder.ai_resume_api.dto.*;
import com.resumebuilder.ai_resume_api.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Mapper(componentModel = "spring", config = MapStructCentralConfig.class)
public interface SubscriptionMapper {

    @Mapping(target = "planType", expression = "java(entity.getPlanType().name())")
    @Mapping(target = "priceDisplay", expression = "java(formatPrice(entity))")
    @Mapping(target = "isFree", expression = "java(entity.isFree())")
    @Mapping(target = "isPro", expression = "java(entity.isPro())")
    SubscriptionPlanDto toPlanDto(SubscriptionPlanEntity entity);

    List<SubscriptionPlanDto> toPlanDtoList(List<SubscriptionPlanEntity> entities);

    @Mapping(target = "status", expression = "java(entity.getStatus().name())")
    @Mapping(target = "isActive", expression = "java(entity.isActive())")
    @Mapping(target = "isTrialing", expression = "java(entity.isTrialing())")
    @Mapping(target = "isPro", expression = "java(entity.isPro())")
    @Mapping(target = "daysUntilRenewal", expression = "java(calculateDaysUntilRenewal(entity))")
    @Mapping(target = "daysRemainingInTrial", expression = "java(calculateDaysRemainingInTrial(entity))")
    UserSubscriptionDto toSubscriptionDto(UserSubscriptionEntity entity);

    @Mapping(target = "amountDisplay", expression = "java(formatPaymentAmount(entity))")
    PaymentHistoryDto toPaymentDto(PaymentHistoryEntity entity);

    List<PaymentHistoryDto> toPaymentDtoList(List<PaymentHistoryEntity> entities);

    default String formatPrice(SubscriptionPlanEntity entity) {
        if (entity.getPriceCents() == null || entity.getPriceCents() == 0) {
            return "Free";
        }
        double dollars = entity.getPriceCents() / 100.0;
        String price = String.format("$%.2f", dollars);
        if (!entity.isFree()) {
            price += "/" + entity.getBillingInterval().toLowerCase();
        }
        return price;
    }

    default String formatPaymentAmount(PaymentHistoryEntity entity) {
        if (entity.getAmountCents() == null) {
            return "$0.00";
        }
        double dollars = entity.getAmountCents() / 100.0;
        return String.format("$%.2f", dollars);
    }

    default Long calculateDaysUntilRenewal(UserSubscriptionEntity entity) {
        if (entity.getCurrentPeriodEnd() == null) {
            return null;
        }
        return Duration.between(Instant.now(), entity.getCurrentPeriodEnd()).toDays();
    }

    default Long calculateDaysRemainingInTrial(UserSubscriptionEntity entity) {
        if (entity.getTrialEnd() == null || !entity.isTrialing()) {
            return null;
        }
        long days = Duration.between(Instant.now(), entity.getTrialEnd()).toDays();
        return days > 0 ? days : 0L;
    }
}