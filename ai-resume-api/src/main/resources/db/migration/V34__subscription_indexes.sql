-- V34: Additional indexes for subscription queries

-- Count resumes by type for a user
CREATE INDEX IF NOT EXISTS idx_resume_user_type_count ON resumes (user_id, resume_type)
WHERE
    user_id IS NOT NULL;

-- Find active subscriptions efficiently
CREATE INDEX IF NOT EXISTS idx_us_active_users ON user_subscriptions (user_id, status)
WHERE
    status IN ('ACTIVE', 'TRIALING');

-- Optimize trial expiry checks
CREATE INDEX IF NOT EXISTS idx_us_trial_ending ON user_subscriptions (trial_end)
WHERE
    trial_end IS NOT NULL
    AND status = 'TRIALING';

-- Optimize period end checks (for cancellations)
CREATE INDEX IF NOT EXISTS idx_us_period_ending ON user_subscriptions (current_period_end)
WHERE
    cancel_at_period_end = TRUE;