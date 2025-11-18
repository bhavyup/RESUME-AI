-- V14__add_display_order_and_indexes.sql
-- Adds display_order to experience, education, resume_language, resume_custom_link, skill
-- and backfills sequential order per resume. Also adds (resume_id, display_order) indexes.

-- Experience
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experience') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experience' AND column_name = 'display_order') THEN
      ALTER TABLE experience ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    END IF;

    UPDATE experience e
    SET display_order = sub.rn - 1
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY resume_id ORDER BY id) AS rn
      FROM experience
    ) sub
    WHERE sub.id = e.id;

    CREATE INDEX IF NOT EXISTS idx_experience_resume_order ON experience(resume_id, display_order);
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experiences') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'display_order') THEN
      ALTER TABLE experiences ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    END IF;

    UPDATE experiences e
    SET display_order = sub.rn - 1
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY resume_id ORDER BY id) AS rn
      FROM experiences
    ) sub
    WHERE sub.id = e.id;

    CREATE INDEX IF NOT EXISTS idx_experience_resume_order ON experiences(resume_id, display_order);
  END IF;
END$$;

-- Education
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'education') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'education' AND column_name = 'display_order') THEN
      ALTER TABLE education ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE education e
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM education
    ) sub
WHERE
    sub.id = e.id;

CREATE INDEX IF NOT EXISTS idx_education_resume_order ON education (resume_id, display_order);

ELSIF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE
        table_name = 'educations'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE
        table_name = 'educations'
        AND column_name = 'display_order'
) THEN
ALTER TABLE educations
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE educations e
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM educations
    ) sub
WHERE
    sub.id = e.id;

CREATE INDEX IF NOT EXISTS idx_education_resume_order ON educations (resume_id, display_order);

END IF;

END$$;

-- Resume languages
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resume_language') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_language' AND column_name = 'display_order') THEN
      ALTER TABLE resume_language ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE resume_language l
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM resume_language
    ) sub
WHERE
    sub.id = l.id;

CREATE INDEX IF NOT EXISTS idx_resume_language_resume_order ON resume_language (resume_id, display_order);

ELSIF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE
        table_name = 'resume_languages'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE
        table_name = 'resume_languages'
        AND column_name = 'display_order'
) THEN
ALTER TABLE resume_languages
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE resume_languages l
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM resume_languages
    ) sub
WHERE
    sub.id = l.id;

CREATE INDEX IF NOT EXISTS idx_resume_language_resume_order ON resume_languages (resume_id, display_order);

END IF;

END$$;

-- Resume custom links
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resume_custom_links') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resume_custom_links' AND column_name = 'display_order') THEN
      ALTER TABLE resume_custom_links ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE resume_custom_links l
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM resume_custom_links
    ) sub
WHERE
    sub.id = l.id;

CREATE INDEX IF NOT EXISTS idx_resume_custom_links_resume_order ON resume_custom_links (resume_id, display_order);

ELSIF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE
        table_name = 'resume_links'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE
        table_name = 'resume_links'
        AND column_name = 'display_order'
) THEN
ALTER TABLE resume_links
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE resume_links l
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM resume_links
    ) sub
WHERE
    sub.id = l.id;

CREATE INDEX IF NOT EXISTS idx_resume_custom_link_resume_order ON resume_links (resume_id, display_order);

END IF;

END$$;

-- Skills
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skill') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skill' AND column_name = 'display_order') THEN
      ALTER TABLE skill ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE skill s
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM skill
    ) sub
WHERE
    sub.id = s.id;

CREATE INDEX IF NOT EXISTS idx_skill_resume_order ON skill (resume_id, display_order);

ELSIF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE
        table_name = 'skills'
) THEN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE
        table_name = 'skills'
        AND column_name = 'display_order'
) THEN
ALTER TABLE skills
ADD COLUMN display_order integer NOT NULL DEFAULT 0;

END IF;

UPDATE skills s
SET
    display_order = sub.rn - 1
FROM (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) AS rn
        FROM skills
    ) sub
WHERE
    sub.id = s.id;

CREATE INDEX IF NOT EXISTS idx_skill_resume_order ON skills (resume_id, display_order);

END IF;

END$$;