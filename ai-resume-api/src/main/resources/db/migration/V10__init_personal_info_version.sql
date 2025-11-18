ALTER TABLE personal_info
ALTER COLUMN version SET DEFAULT 0;

UPDATE personal_info
SET version = 0
WHERE version IS NULL;

-- Optional: make it NOT NULL in dev to prevent future NULLs
-- ALTER TABLE personal_info ALTER COLUMN version SET NOT NULL;