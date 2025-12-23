-- V25__add_resume_credentials.sql
-- Certifications & licenses at resume level

CREATE TABLE IF NOT EXISTS resume_credentials (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    name varchar(255) NOT NULL,
    type varchar(16), -- CERTIFICATION / LICENSE
    issuer varchar(255) NOT NULL,
    issuer_url varchar(1024),
    issue_date date,
    expiry_date date,
    does_not_expire boolean NOT NULL DEFAULT false,
    credential_id varchar(128),
    credential_url varchar(2048),
    score numeric(10, 2),
    score_unit varchar(32),
    level varchar(128),
    status varchar(16), -- ACTIVE / EXPIRED / REVOKED / SUSPENDED / PENDING
    description text,
    badge_image_url varchar(2048),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Keywords / tags (ordered)
CREATE TABLE IF NOT EXISTS resume_credential_keywords (
    credential_id bigint NOT NULL REFERENCES resume_credentials (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    keyword varchar(64) NOT NULL,
    PRIMARY KEY (credential_id, tag_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rc_resume_order ON resume_credentials (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_rc_resume_issue_date ON resume_credentials (resume_id, issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_rc_resume_lower_name ON resume_credentials (resume_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_rc_credential_id ON resume_credentials (credential_id);