-- V16__add_common_indexes.sql
-- High-impact indexes based on your actual table names.

-- 1) Resumes listing for current user, ordered by updated_at
-- Combines user_id and updated_at for efficient ORDER BY
CREATE INDEX IF NOT EXISTS idx_resumes_user_updatedat ON resumes (user_id, updated_at DESC);

-- 2) Users lookup — index on username for equality, plus case-insensitive index if you add case-insensitive checks later
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='ux_users_username') THEN
    BEGIN
      EXECUTE 'CREATE UNIQUE INDEX ux_users_username ON users (username)';
    EXCEPTION WHEN unique_violation THEN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_users_username') THEN
        EXECUTE 'CREATE INDEX idx_users_username ON users (username)';
      END IF;
    END;
  END IF;
END$$;

-- Optional expression index for case-insensitive lookups (useful if you change queries to lower(username) = lower(:u))
CREATE INDEX IF NOT EXISTS idx_users_lower_username ON users (lower(username));

-- 3) Child collections by resume ordered by display_order
CREATE INDEX IF NOT EXISTS idx_experiences_resume_order ON experiences (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_educations_resume_order ON educations (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_resume_languages_resume_order ON resume_languages (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_resume_custom_links_resume_order ON resume_custom_links (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_skills_resume_order ON skills (resume_id, display_order);

-- 4) Certifications by skill
CREATE INDEX IF NOT EXISTS idx_certifications_skill ON certifications (skill_id);

-- 5) Category existence check by (resume_id, lower(name)) for IgnoreCase lookups
CREATE INDEX IF NOT EXISTS idx_skill_categories_resume_lowername ON skill_categories (resume_id, lower(name));

-- Optional: turn into a UNIQUE index once data is clean and you want to enforce case-insensitive uniqueness:
-- CREATE UNIQUE INDEX ux_skill_categories_resume_lowername ON skill_categories (resume_id, lower(name));