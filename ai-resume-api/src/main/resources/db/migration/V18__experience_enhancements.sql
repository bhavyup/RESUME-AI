-- V17__experience_enhancements.sql
-- Extend experiences + add element collections for bullets/tags/links

-- 1) Add new columns on experiences
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS company_website varchar(255),
ADD COLUMN IF NOT EXISTS location_city varchar(128),
ADD COLUMN IF NOT EXISTS location_state varchar(128),
ADD COLUMN IF NOT EXISTS location_country varchar(128),
ADD COLUMN IF NOT EXISTS remote boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS employment_type varchar(32),
ADD COLUMN IF NOT EXISTS currently_working boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS manager_name varchar(128),
ADD COLUMN IF NOT EXISTS manager_contact varchar(255),
ADD COLUMN IF NOT EXISTS team_size integer,
ADD COLUMN IF NOT EXISTS seniority_level varchar(32),
ADD COLUMN IF NOT EXISTS reports_to_title varchar(128),
ADD COLUMN IF NOT EXISTS confidential boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS star_situation text,
ADD COLUMN IF NOT EXISTS star_task text,
ADD COLUMN IF NOT EXISTS star_action text,
ADD COLUMN IF NOT EXISTS star_result text,
ADD COLUMN IF NOT EXISTS kpi_revenue_impact_usd numeric(19, 2),
ADD COLUMN IF NOT EXISTS kpi_percent_improvement numeric(5, 2),
ADD COLUMN IF NOT EXISTS kpi_time_saved_hours integer,
ADD COLUMN IF NOT EXISTS kpi_users integer,
ADD COLUMN IF NOT EXISTS kpi_arr_usd numeric(19, 2);

-- Normalize existing null employment_type to a safe value later via app parsing; DB allows null for now.

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_exp_company ON experiences (company_name);

CREATE INDEX IF NOT EXISTS idx_exp_employment_type ON experiences (employment_type);

-- 2) Element collections: responsibilities (bullets)
CREATE TABLE IF NOT EXISTS experience_responsibilities (
    experience_id bigint NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text text NOT NULL,
    PRIMARY KEY (experience_id, line_order)
);

-- 3) Element collections: achievements (bullets)
CREATE TABLE IF NOT EXISTS experience_achievements (
    experience_id bigint NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text text NOT NULL,
    PRIMARY KEY (experience_id, line_order)
);

-- 4) Element collections: technologies (tags)
CREATE TABLE IF NOT EXISTS experience_technologies (
    experience_id bigint NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    tag varchar(128) NOT NULL,
    PRIMARY KEY (experience_id, tag_order)
);

CREATE INDEX IF NOT EXISTS idx_exp_tech_experience ON experience_technologies (experience_id);

-- 5) Element collections: methods/frameworks/tools (tags)
CREATE TABLE IF NOT EXISTS experience_methods (
    experience_id bigint NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    tag varchar(128) NOT NULL,
    PRIMARY KEY (experience_id, tag_order)
);

CREATE INDEX IF NOT EXISTS idx_exp_methods_experience ON experience_methods (experience_id);

-- 6) Element collections: links (title + url)
CREATE TABLE IF NOT EXISTS experience_links (
    experience_id bigint NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    title varchar(255),
    url varchar(1024),
    PRIMARY KEY (experience_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_exp_links_experience ON experience_links (experience_id);