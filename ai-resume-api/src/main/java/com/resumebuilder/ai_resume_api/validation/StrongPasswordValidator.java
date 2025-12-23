package com.resumebuilder.ai_resume_api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null)
            return false;
        boolean hasUpper = value.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = value.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = value.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = value.chars().anyMatch(c -> "!@#$%^&*()_+[]{}|;:'\",.<>/?`~-=\\"
                .indexOf(c) >= 0);
        return value.length() >= 8 && value.length() <= 256 && hasUpper && hasLower && hasDigit && hasSpecial;
    }
}