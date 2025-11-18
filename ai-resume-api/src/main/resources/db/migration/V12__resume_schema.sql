-- Resume module schema alignment (PostgreSQL)

-- 1) resumes: add version + auditing columns + indexes
ALTER TABLE IF EXISTS resumes
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_resume_user ON resumes (user_id);

CREATE INDEX IF NOT EXISTS idx_resume_updated_at ON resumes (updated_at);

-- 2) resume_custom_links: enforce lengths + NOT NULL + version + index
ALTER TABLE IF EXISTS resume_custom_links
ALTER COLUMN title TYPE VARCHAR(255),
ALTER COLUMN url TYPE VARCHAR(2048);

UPDATE resume_custom_links SET title = COALESCE(title, 'Untitled');

UPDATE resume_custom_links SET url = COALESCE(url, '');

ALTER TABLE IF EXISTS resume_custom_links
ALTER COLUMN title
SET NOT NULL,
ALTER COLUMN url
SET NOT NULL;

ALTER TABLE IF EXISTS resume_custom_links
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_rcl_resume ON resume_custom_links (resume_id);

-- 3) resume_languages: enforce lengths + NOT NULL + version + unique + index
ALTER TABLE IF EXISTS resume_languages
ALTER COLUMN language_name TYPE VARCHAR(64),
ALTER COLUMN proficiency TYPE VARCHAR(64);

UPDATE resume_languages
SET
    language_name = COALESCE(language_name, 'Unknown');

UPDATE resume_languages
SET
    proficiency = COALESCE(proficiency, 'Unknown');

ALTER TABLE IF EXISTS resume_languages
ALTER COLUMN language_name
SET NOT NULL,
ALTER COLUMN proficiency
SET NOT NULL;

ALTER TABLE IF EXISTS resume_languages
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- Enforce unique language per resume (use unique index for idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS uk_resume_language_name ON resume_languages (resume_id, language_name);

CREATE INDEX IF NOT EXISTS idx_rl_resume ON resume_languages (resume_id);

-- 4) skill_categories: enforce lengths + NOT NULL + version + unique + index
ALTER TABLE IF EXISTS skill_categories
ALTER COLUMN name TYPE VARCHAR(128);

UPDATE skill_categories SET name = COALESCE(name, 'General');

ALTER TABLE IF EXISTS skill_categories
ALTER COLUMN name
SET NOT NULL;

ALTER TABLE IF EXISTS skill_categories
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS uk_skill_category_name ON skill_categories (resume_id, name);

CREATE INDEX IF NOT EXISTS idx_sc_resume ON skill_categories (resume_id);

-- 5) skills: enforce lengths + NOT NULL + version + indexes
ALTER TABLE IF EXISTS skills ALTER COLUMN name TYPE VARCHAR(128);

UPDATE skills SET name = COALESCE(name, 'Skill');

ALTER TABLE IF EXISTS skills ALTER COLUMN name SET NOT NULL;

-- Ensure proficiency_level is NOT NULL (defaults to 1 if missing)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'skills' AND column_name = 'proficiency_level'
    ) THEN
        UPDATE skills SET proficiency_level = 1 WHERE proficiency_level IS NULL;
        ALTER TABLE skills ALTER COLUMN proficiency_level SET NOT NULL;
    END IF;
END$$;

ALTER TABLE IF EXISTS skills
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sk_resume   ON skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_sk_category ON skills(category_id);

-- 6) experiences: enforce lengths + version + indexes
ALTER TABLE IF EXISTS experiences
    ALTER COLUMN job_title    TYPE VARCHAR(255),
    ALTER COLUMN company_name TYPE VARCHAR(255),
    ALTER COLUMN location     TYPE VARCHAR(255);

ALTER TABLE IF EXISTS experiences
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_exp_resume      ON experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_exp_start_date  ON experiences(start_date);

-- 7) educations: enforce lengths + version + index
ALTER TABLE IF EXISTS educations
    ALTER COLUMN degree         TYPE VARCHAR(255),
    ALTER COLUMN institution    TYPE VARCHAR(255),
    ALTER COLUMN field_of_study TYPE VARCHAR(255),
    ALTER COLUMN start_date     TYPE VARCHAR(64),
    ALTER COLUMN end_date       TYPE VARCHAR(64);

ALTER TABLE IF EXISTS educations
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_edu_resume ON educations(resume_id);

-- 8) certifications: enforce lengths + version + index
ALTER TABLE IF EXISTS certifications
    ALTER COLUMN name         TYPE VARCHAR(255),
    ALTER COLUMN url          TYPE VARCHAR(2048),
    ALTER COLUMN document_url TYPE VARCHAR(2048);

ALTER TABLE IF EXISTS certifications
    ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_cert_skill ON certifications(skill_id);