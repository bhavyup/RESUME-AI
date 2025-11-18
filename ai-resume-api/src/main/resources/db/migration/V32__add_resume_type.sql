-- V32: Add resume type distinction (BASE vs TAILORED)

-- Add resume_type column
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS resume_type VARCHAR(16) NOT NULL DEFAULT 'BASE';

-- Add index for filtering by type
CREATE INDEX IF NOT EXISTS idx_resume_type ON resumes (resume_type);

-- Add composite index for user + type queries
CREATE INDEX IF NOT EXISTS idx_resume_user_type ON resumes (user_id, resume_type);

-- Add optional foreign key for tailored resumes (reference to base resume)
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS base_resume_id BIGINT NULL REFERENCES resumes (id) ON DELETE SET NULL;

-- Index for finding tailored versions of a base resume
CREATE INDEX IF NOT EXISTS idx_resume_base ON resumes (base_resume_id)
WHERE
    base_resume_id IS NOT NULL;

-- Add job description for tailored resumes
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS job_description TEXT NULL;

COMMENT ON COLUMN resumes.resume_type IS 'Type: BASE (master resume) or TAILORED (job-specific)';

COMMENT ON COLUMN resumes.base_resume_id IS 'If TAILORED, references the BASE resume it was created from';

COMMENT ON COLUMN resumes.job_description IS 'Job description used for tailoring (TAILORED resumes only)';