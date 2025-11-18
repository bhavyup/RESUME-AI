-- V33: Subscription and payment system

-- ============================================
-- 1. Subscription Plans (FREE and PRO)
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    plan_type VARCHAR(16) NOT NULL UNIQUE, -- FREE, PRO
    display_name VARCHAR(64) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL DEFAULT 0, -- $0 for FREE, $1500 for PRO ($15.00)
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_interval VARCHAR(16) NOT NULL DEFAULT 'MONTH', -- MONTH, YEAR

-- Stripe integration
stripe_price_id VARCHAR(128), -- Stripe Price ID (e.g., price_xxx)
stripe_product_id VARCHAR(128), -- Stripe Product ID (e.g., prod_xxx)

-- Feature limits (NULL = unlimited)
max_base_resumes INT, -- NULL = unlimited, 3 = free limit
max_tailored_resumes INT, -- NULL = unlimited, 5 = free limit
ai_generations_per_month INT, -- NULL = unlimited, 1 = free limit
cover_letters_per_resume INT, -- NULL = unlimited, 1 = free limit
ats_scores_per_resume INT, -- NULL = unlimited, 1 = free limit
custom_templates_enabled BOOLEAN NOT NULL DEFAULT FALSE,

-- Metadata
is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trial_period_days INT DEFAULT 0, -- 14 for PRO, 0 for FREE
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active plans
CREATE INDEX idx_sp_active ON subscription_plans (is_active)
WHERE
    is_active = TRUE;

-- ============================================
-- 2. User Subscriptions (one per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),

-- Stripe integration
stripe_customer_id VARCHAR(128) UNIQUE, -- Stripe Customer ID
stripe_subscription_id VARCHAR(128) UNIQUE, -- Stripe Subscription ID

-- Status
status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, TRIALING, CANCELED, etc.

-- Billing period
current_period_start TIMESTAMPTZ, current_period_end TIMESTAMPTZ,

-- Trial
trial_start TIMESTAMPTZ, trial_end TIMESTAMPTZ,

-- Cancellation
cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
canceled_at TIMESTAMPTZ,

-- Metadata
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

-- Ensure user has exactly one subscription
CONSTRAINT uk_user_subscription UNIQUE(user_id) );

-- Indexes
CREATE INDEX idx_us_user ON user_subscriptions (user_id);

CREATE INDEX idx_us_plan ON user_subscriptions (plan_id);

CREATE INDEX idx_us_stripe_customer ON user_subscriptions (stripe_customer_id);

CREATE INDEX idx_us_stripe_subscription ON user_subscriptions (stripe_subscription_id);

CREATE INDEX idx_us_status ON user_subscriptions (status);

-- ============================================
-- 3. Usage Tracking (for monthly limits)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_type VARCHAR(32) NOT NULL, -- AI_GENERATION, COVER_LETTER, ATS_SCORE

-- Resource reference (optional)
resource_type VARCHAR(32), -- RESUME, EXPERIENCE, etc.
resource_id BIGINT,

-- Billing period tracking
billing_period_start TIMESTAMPTZ NOT NULL,
billing_period_end TIMESTAMPTZ NOT NULL,

-- Metadata
metadata JSONB, -- Store additional context (model used, tokens, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for counting usage within billing periods
CREATE INDEX idx_ut_user_type_period ON usage_tracking (
    user_id,
    usage_type,
    billing_period_start,
    billing_period_end
);

CREATE INDEX idx_ut_user_period ON usage_tracking (user_id, billing_period_start);

CREATE INDEX idx_ut_created ON usage_tracking (created_at);

-- ============================================
-- 4. Payment History (for receipts/invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id BIGINT REFERENCES user_subscriptions(id) ON DELETE SET NULL,

-- Stripe data
stripe_payment_intent_id VARCHAR(128) UNIQUE,
stripe_invoice_id VARCHAR(128),
stripe_charge_id VARCHAR(128),

-- Payment details
amount_cents INT NOT NULL,
currency VARCHAR(3) NOT NULL DEFAULT 'USD',
status VARCHAR(32) NOT NULL, -- SUCCEEDED, FAILED, PENDING, REFUNDED

-- Receipt
receipt_url TEXT, invoice_pdf TEXT,

-- Timestamps
payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ph_user ON payment_history (user_id);

CREATE INDEX idx_ph_subscription ON payment_history (subscription_id);

CREATE INDEX idx_ph_stripe_payment ON payment_history (stripe_payment_intent_id);

CREATE INDEX idx_ph_status ON payment_history (status);

CREATE INDEX idx_ph_date ON payment_history (payment_date DESC);

-- ============================================
-- 5. Seed Default Plans
-- ============================================

-- FREE Plan
-- FREE Plan
INSERT INTO
    subscription_plans (
        plan_type,
        display_name,
        description,
        price_cents,
        currency,
        billing_interval,
        max_base_resumes,
        max_tailored_resumes,
        ai_generations_per_month,
        cover_letters_per_resume,
        ats_scores_per_resume,
        custom_templates_enabled,
        trial_period_days
    )
VALUES (
        'FREE',
        'Free Plan',
        'Perfect for getting started with resume building',
        0,
        'USD',
        'MONTH',
        3, -- 3 base resumes
        5, -- 5 tailored resumes
        NULL, -- No general AI generation limit (specific limits per feature)
        1, -- 1 cover letter per resume
        1, -- 1 ATS score per resume
        FALSE, -- No custom templates
        0 -- No trial
    )
ON CONFLICT (plan_type) DO NOTHING;

-- PRO Plan
INSERT INTO
    subscription_plans (
        plan_type,
        display_name,
        description,
        price_cents,
        currency,
        billing_interval,
        max_base_resumes,
        max_tailored_resumes,
        ai_generations_per_month,
        cover_letters_per_resume,
        ats_scores_per_resume,
        custom_templates_enabled,
        trial_period_days
    )
VALUES (
        'PRO',
        'Pro Plan',
        'Unlimited everything for professionals',
        1500, -- $15.00
        'USD',
        'MONTH',
        NULL, -- Unlimited base resumes
        NULL, -- Unlimited tailored resumes
        NULL, -- Unlimited AI generations
        NULL, -- Unlimited cover letters
        NULL, -- Unlimited ATS scores
        TRUE, -- Custom templates enabled
        14 -- 14-day trial
    )
ON CONFLICT (plan_type) DO NOTHING;

-- ============================================
-- 6. Assign FREE plan to existing users
-- ============================================

-- Get FREE plan ID
DO $$
DECLARE
    free_plan_id BIGINT;
BEGIN
    SELECT id INTO free_plan_id FROM subscription_plans WHERE plan_type = 'FREE';
    
    -- Assign FREE plan to all users who don't have a subscription
    INSERT INTO user_subscriptions (user_id, plan_id, status, created_at, updated_at)
    SELECT 
        u.id,
        free_plan_id,
        'ACTIVE',
        NOW(),
        NOW()
    FROM users u
    WHERE NOT EXISTS (
        SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
    );
END $$;