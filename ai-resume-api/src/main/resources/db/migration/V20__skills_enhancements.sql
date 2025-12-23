-- V20__skills_enhancements.sql
-- Extend 'skills' with named proficiency, last-used, primary flag; add keywords.

ALTER TABLE skills
ADD COLUMN IF NOT EXISTS proficiency_name varchar(32),
ADD COLUMN IF NOT EXISTS last_used date,
ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;

-- Keywords for ATS matching (ordered)
CREATE TABLE IF NOT EXISTS skill_keywords (
    skill_id bigint NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    keyword varchar(64) NOT NULL,
    PRIMARY KEY (skill_id, tag_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_skills_last_used ON skills (last_used DESC);

CREATE INDEX IF NOT EXISTS idx_skills_resume_lowername ON skills (resume_id, lower(name));