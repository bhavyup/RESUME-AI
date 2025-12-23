-- V15__add_display_order_to_skill_categories.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'skill_categories' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE skill_categories ADD COLUMN display_order integer;
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY resume_id ORDER BY id) - 1 AS rn
      FROM skill_categories
    )
    UPDATE skill_categories c SET display_order = o.rn
    FROM ordered o WHERE o.id = c.id;
    ALTER TABLE skill_categories ALTER COLUMN display_order SET DEFAULT 0;
    ALTER TABLE skill_categories ALTER COLUMN display_order SET NOT NULL;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_skill_categories_resume_order ON skill_categories(resume_id, display_order);
END$$;