-- V15__normalize_enum_values.sql
-- Normalize and enforce enum-friendly values for:
--   resumes.skill_proficiency_type
--   resume_languages.proficiency

-- 1) resumes.skill_proficiency_type
-- Allowed set (for now): 'NUMERIC', 'INTEGER' (we'll keep both for compatibility, default to NUMERIC)
UPDATE resumes
SET
    skill_proficiency_type = 'NUMERIC'
WHERE
    skill_proficiency_type IS NULL
    OR trim(skill_proficiency_type) = '';

UPDATE resumes
SET
    skill_proficiency_type = upper(skill_proficiency_type)
WHERE
    skill_proficiency_type IS NOT NULL;

-- Force unknowns to safe default
UPDATE resumes
SET
    skill_proficiency_type = 'NUMERIC'
WHERE
    skill_proficiency_type NOT IN ('NUMERIC', 'STRING');

-- Optional: enforce NOT NULL + DEFAULT
ALTER TABLE resumes
ALTER COLUMN skill_proficiency_type
SET DEFAULT 'NUMERIC';

ALTER TABLE resumes ALTER COLUMN skill_proficiency_type SET NOT NULL;

-- 2) resume_languages.proficiency
-- Canonical enum values we will support:
--   ELEMENTARY, LIMITED_WORKING, PROFESSIONAL_WORKING, FULL_PROFESSIONAL, NATIVE

-- Map common variants to canonical values
UPDATE resume_languages
SET
    proficiency = 'NATIVE'
WHERE
    proficiency ILIKE 'native%'
    OR proficiency ILIKE 'bilingual%';

UPDATE resume_languages
SET
    proficiency = 'FULL_PROFESSIONAL'
WHERE
    proficiency ILIKE 'full%'
    OR proficiency ILIKE 'fluent%';

UPDATE resume_languages
SET
    proficiency = 'PROFESSIONAL_WORKING'
WHERE
    proficiency ILIKE 'professional%';

UPDATE resume_languages
SET
    proficiency = 'LIMITED_WORKING'
WHERE
    proficiency ILIKE 'limited%';

UPDATE resume_languages
SET
    proficiency = 'ELEMENTARY'
WHERE
    proficiency ILIKE 'elementary%'
    OR proficiency ILIKE 'beginner%';

-- Default empty -> PROFESSIONAL_WORKING
UPDATE resume_languages
SET
    proficiency = 'PROFESSIONAL_WORKING'
WHERE
    proficiency IS NULL
    OR trim(proficiency) = '';

-- Normalize leftovers to UPPER_SNAKE_CASE
UPDATE resume_languages
SET
    proficiency = upper(
        regexp_replace(
            proficiency,
            '[^A-Za-z]+',
            '_',
            'g'
        )
    )
WHERE
    proficiency IS NOT NULL;

-- Force unknowns to a safe default
UPDATE resume_languages
SET
    proficiency = 'PROFESSIONAL_WORKING'
WHERE
    proficiency NOT IN (
        'ELEMENTARY',
        'LIMITED_WORKING',
        'PROFESSIONAL_WORKING',
        'FULL_PROFESSIONAL',
        'NATIVE'
    );

-- Optional: enforce NOT NULL
ALTER TABLE resume_languages ALTER COLUMN proficiency SET NOT NULL;