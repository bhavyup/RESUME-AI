-- Personal Info Experiences (global user profile data)
CREATE TABLE personal_info_experiences (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info(user_id) ON DELETE CASCADE,

-- Basic info (matching ExperienceEntity)
job_title VARCHAR(255),
company_name VARCHAR(255),
company_website VARCHAR(255),

-- Location
location VARCHAR(255),
location_city VARCHAR(128),
location_state VARCHAR(128),
location_country VARCHAR(128),
remote BOOLEAN NOT NULL DEFAULT false,

-- Employment details
employment_type VARCHAR(32),
start_date DATE,
end_date DATE,
currently_working BOOLEAN NOT NULL DEFAULT false,

-- Description
description TEXT,

-- Manager info
manager_name VARCHAR(128),
manager_contact VARCHAR(255),
team_size INTEGER,
seniority_level VARCHAR(32),
reports_to_title VARCHAR(128),
confidential BOOLEAN NOT NULL DEFAULT false,

-- STAR fields
star_situation TEXT,
star_task TEXT,
star_action TEXT,
star_result TEXT,

-- KPIs
kpi_revenue_impact_usd NUMERIC(19, 2),
kpi_percent_improvement NUMERIC(5, 2),
kpi_time_saved_hours INTEGER,
kpi_users INTEGER,
kpi_arr_usd NUMERIC(19, 2),

-- Metadata
version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_pi_exp_personal_info ON personal_info_experiences (personal_info_id);

CREATE INDEX idx_pi_exp_start_date ON personal_info_experiences (start_date);

CREATE INDEX idx_pi_exp_company ON personal_info_experiences (company_name);

-- Child tables (Element Collections)

-- Responsibilities
CREATE TABLE personal_info_experience_responsibilities (
    experience_id BIGINT NOT NULL REFERENCES personal_info_experiences (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text TEXT NOT NULL,
    PRIMARY KEY (experience_id, line_order)
);

-- Achievements
CREATE TABLE personal_info_experience_achievements (
    experience_id BIGINT NOT NULL REFERENCES personal_info_experiences (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text TEXT NOT NULL,
    PRIMARY KEY (experience_id, line_order)
);

-- Technologies
CREATE TABLE personal_info_experience_technologies (
    experience_id BIGINT NOT NULL REFERENCES personal_info_experiences (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    tag VARCHAR(128) NOT NULL,
    PRIMARY KEY (experience_id, tag_order)
);

-- Methods
CREATE TABLE personal_info_experience_methods (
    experience_id BIGINT NOT NULL REFERENCES personal_info_experiences (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    tag VARCHAR(128) NOT NULL,
    PRIMARY KEY (experience_id, tag_order)
);

-- Links
CREATE TABLE personal_info_experience_links (
    experience_id BIGINT NOT NULL REFERENCES personal_info_experiences (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    title VARCHAR(255),
    url VARCHAR(1024),
    PRIMARY KEY (experience_id, display_order)
);

-- Add linking support to resume experiences
ALTER TABLE experiences
ADD COLUMN linked_profile_experience_id BIGINT REFERENCES personal_info_experiences (id) ON DELETE SET NULL;

CREATE INDEX idx_exp_linked_profile ON experiences (linked_profile_experience_id);

COMMENT ON COLUMN experiences.linked_profile_experience_id IS 'Optional FK to profile experience for sync functionality';