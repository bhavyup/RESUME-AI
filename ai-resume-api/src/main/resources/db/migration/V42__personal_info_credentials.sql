-- Personal Info Credentials (Certifications & Licenses)
CREATE TABLE personal_info_credentials (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(16), -- CERTIFICATION or LICENSE
    issuer VARCHAR(255) NOT NULL,
    issuer_url VARCHAR(1024),
    issue_date DATE,
    expiry_date DATE,
    does_not_expire BOOLEAN NOT NULL DEFAULT false,
    credential_id VARCHAR(128),
    credential_url VARCHAR(2048),
    score NUMERIC(10, 2),
    score_unit VARCHAR(32),
    level VARCHAR(128),
    status VARCHAR(16),
    description TEXT,
    badge_image_url VARCHAR(2048),
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_cred_personal_info ON personal_info_credentials (personal_info_id);

CREATE INDEX idx_pi_cred_issue_date ON personal_info_credentials (issue_date);

-- Child tables

CREATE TABLE personal_info_credential_keywords (
    credential_id BIGINT NOT NULL REFERENCES personal_info_credentials (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    keyword VARCHAR(64) NOT NULL,
    PRIMARY KEY (credential_id, tag_order)
);

-- Add linking support
ALTER TABLE resume_credentials
ADD COLUMN linked_profile_credential_id BIGINT REFERENCES personal_info_credentials (id) ON DELETE SET NULL;

CREATE INDEX idx_cred_linked_profile ON resume_credentials (linked_profile_credential_id);