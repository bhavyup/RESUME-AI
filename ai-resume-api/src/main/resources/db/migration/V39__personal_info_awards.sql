-- Personal Info Awards
CREATE TABLE personal_info_awards (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issuer_url VARCHAR(1024),
    date_received DATE,
    description TEXT,
    monetary_amount_usd NUMERIC(19, 2),
    currency_code VARCHAR(3),
    award_type VARCHAR(32),
    link_title VARCHAR(255),
    link_url VARCHAR(2048),
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_award_personal_info ON personal_info_awards (personal_info_id);

CREATE INDEX idx_pi_award_date ON personal_info_awards (date_received);

-- Add linking support to resume awards
ALTER TABLE awards
ADD COLUMN linked_profile_award_id BIGINT REFERENCES personal_info_awards (id) ON DELETE SET NULL;

CREATE INDEX idx_award_linked_profile ON awards (linked_profile_award_id);

COMMENT ON COLUMN awards.linked_profile_award_id IS 'Optional FK to profile award for sync functionality';