-- V19__education_enhancements.sql
-- Extend educations + add element collections for awards and projects/links

ALTER TABLE educations
ADD COLUMN IF NOT EXISTS institution_website varchar(255),
ADD COLUMN IF NOT EXISTS location_city varchar(128),
ADD COLUMN IF NOT EXISTS location_country varchar(128),
ADD COLUMN IF NOT EXISTS graduation_date varchar(64),
ADD COLUMN IF NOT EXISTS expected_graduation boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS currently_enrolled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS show_gpa boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS honors text,
ADD COLUMN IF NOT EXISTS show_honors boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS thesis_title text,
ADD COLUMN IF NOT EXISTS research_area text,
ADD COLUMN IF NOT EXISTS grade_class varchar(64);

-- Awards / scholarships (ordered text lines)
CREATE TABLE IF NOT EXISTS education_awards (
    education_id bigint NOT NULL REFERENCES educations (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text text NOT NULL,
    PRIMARY KEY (education_id, line_order)
);

-- Projects / dissertations (title + url, ordered)
CREATE TABLE IF NOT EXISTS education_projects (
    education_id bigint NOT NULL REFERENCES educations (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    title varchar(255),
    url varchar(1024),
    PRIMARY KEY (education_id, display_order)
);

-- Helpful index for sorting within resume (already likely present, but ensure)
CREATE INDEX IF NOT EXISTS idx_educations_resume_order ON educations (resume_id, display_order);