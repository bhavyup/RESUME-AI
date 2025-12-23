-- V22__add_awards_honors_scholarships.sql
-- Awards / Honors / Scholarships section

CREATE TABLE IF NOT EXISTS awards (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL,
    issuer varchar(255) NOT NULL, -- issuing organization
    issuer_url varchar(1024),
    date_received date,
    description text,
    monetary_amount_usd numeric(19, 2),
    currency_code varchar(3), -- ISO 4217 (e.g., USD, EUR)
    award_type varchar(32), -- AWARD / HONOR / SCHOLARSHIP
    link_title varchar(255),
    link_url varchar(2048),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_awards_resume_order ON awards (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_awards_resume_date ON awards (resume_id, date_received);

CREATE INDEX IF NOT EXISTS idx_awards_resume_lower_title ON awards (resume_id, lower(title));