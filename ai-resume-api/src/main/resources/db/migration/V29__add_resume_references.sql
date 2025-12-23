-- V29__add_resume_references.sql
-- References + resume-level "references available on request" toggle

ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS references_on_request boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS resume_references (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    name varchar(255) NOT NULL,
    title varchar(255),
    company varchar(255),
    relationship varchar(16), -- MANAGER/PEER/PROFESSOR/... (see enum)
    preferred_contact_method varchar(16), -- EMAIL/PHONE/LINKEDIN/WEBSITE/OTHER
    email varchar(320),
    phone varchar(64),
    linkedin_url varchar(2048),
    website_url varchar(2048),
    consent_to_share boolean NOT NULL DEFAULT false,
    visible boolean NOT NULL DEFAULT false,
    relationship_note varchar(255),
    note text,
    last_verified_on date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rref_resume_order ON resume_references (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_rref_resume_lower_name ON resume_references (resume_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_rref_resume_lower_comp ON resume_references (resume_id, lower(company));

CREATE INDEX IF NOT EXISTS idx_rref_email ON resume_references (email);