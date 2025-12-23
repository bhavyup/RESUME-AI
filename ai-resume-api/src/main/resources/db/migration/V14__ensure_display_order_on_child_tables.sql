-- V15__ensure_display_order_on_child_tables.sql
-- Idempotently ensure display_order column + index exist on the child tables used for reordering.
-- Uses exact table names in your schema: experiences, educations, resume_languages, resume_custom_links, skills.

-- experiences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'experiences' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE experiences ADD COLUMN display_order integer;
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY resume_id ORDER BY id) - 1 AS rn
      FROM experiences
    )
    UPDATE experiences e SET display_order = o.rn
    FROM ordered o WHERE o.id = e.id;
    ALTER TABLE experiences ALTER COLUMN display_order SET DEFAULT 0;
    ALTER TABLE experiences ALTER COLUMN display_order SET NOT NULL;
  END IF;
  CREATE INDEX IF NOT EXISTS idx_experiences_resume_order ON experiences(resume_id, display_order);
END$$;

-- educations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'educations' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE educations ADD COLUMN display_order integer;

WITH
    ordered AS (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) - 1 AS rn
        FROM educations
    )
UPDATE educations e
SET
    display_order = o.rn
FROM ordered o
WHERE
    o.id = e.id;

ALTER TABLE educations ALTER COLUMN display_order SET DEFAULT 0;

ALTER TABLE educations ALTER COLUMN display_order SET NOT NULL;

END IF;

CREATE INDEX IF NOT EXISTS idx_educations_resume_order ON educations (resume_id, display_order);

END$$;

-- resume_languages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resume_languages' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE resume_languages ADD COLUMN display_order integer;

WITH
    ordered AS (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) - 1 AS rn
        FROM resume_languages
    )
UPDATE resume_languages l
SET
    display_order = o.rn
FROM ordered o
WHERE
    o.id = l.id;

ALTER TABLE resume_languages
ALTER COLUMN display_order
SET DEFAULT 0;

ALTER TABLE resume_languages ALTER COLUMN display_order SET NOT NULL;

END IF;

CREATE INDEX IF NOT EXISTS idx_resume_languages_resume_order ON resume_languages (resume_id, display_order);

END$$;

-- resume_custom_links (this is the one your DB actually has)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resume_custom_links' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE resume_custom_links ADD COLUMN display_order integer;

WITH
    ordered AS (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) - 1 AS rn
        FROM resume_custom_links
    )
UPDATE resume_custom_links l
SET
    display_order = o.rn
FROM ordered o
WHERE
    o.id = l.id;

ALTER TABLE resume_custom_links
ALTER COLUMN display_order
SET DEFAULT 0;

ALTER TABLE resume_custom_links
ALTER COLUMN display_order
SET NOT NULL;

END IF;

CREATE INDEX IF NOT EXISTS idx_resume_custom_links_resume_order ON resume_custom_links (resume_id, display_order);

END$$;

-- skills
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE skills ADD COLUMN display_order integer;

WITH
    ordered AS (
        SELECT id, ROW_NUMBER() OVER (
                PARTITION BY
                    resume_id
                ORDER BY id
            ) - 1 AS rn
        FROM skills
    )
UPDATE skills s
SET
    display_order = o.rn
FROM ordered o
WHERE
    o.id = s.id;

ALTER TABLE skills ALTER COLUMN display_order SET DEFAULT 0;

ALTER TABLE skills ALTER COLUMN display_order SET NOT NULL;

END IF;

CREATE INDEX IF NOT EXISTS idx_skills_resume_order ON skills (resume_id, display_order);

END$$;