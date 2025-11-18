-- Personal Info References
CREATE TABLE personal_info_references (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    relationship VARCHAR(16),
    preferred_contact_method VARCHAR(16),
    email VARCHAR(320),
    phone VARCHAR(64),
    linkedin_url VARCHAR(2048),
    website_url VARCHAR(2048),
    consent_to_share BOOLEAN NOT NULL DEFAULT false,
    visible BOOLEAN NOT NULL DEFAULT true,
    relationship_note VARCHAR(255),
    note TEXT,
    last_verified_on DATE,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_ref_personal_info ON personal_info_references (personal_info_id);

-- Add linking support
ALTER TABLE resume_references
ADD COLUMN linked_profile_reference_id BIGINT REFERENCES personal_info_references (id) ON DELETE SET NULL;

CREATE INDEX idx_ref_linked_profile ON resume_references (linked_profile_reference_id);