-- Personal Info Education (global user profile data)
CREATE TABLE personal_info_education (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info(user_id) ON DELETE CASCADE,

-- Basic info (matching EducationEntity)
degree VARCHAR(255),
institution VARCHAR(255),
field_of_study VARCHAR(255),
institution_website VARCHAR(255),

-- Location
location_city VARCHAR(128), location_country VARCHAR(128),

-- Dates (free-form strings matching existing pattern)
start_date VARCHAR(64),
end_date VARCHAR(64),
graduation_date VARCHAR(64),
expected_graduation BOOLEAN NOT NULL DEFAULT false,
currently_enrolled BOOLEAN NOT NULL DEFAULT false,

-- GPA
gpa DOUBLE PRECISION, show_gpa BOOLEAN NOT NULL DEFAULT true,

-- Honors
honors TEXT,
show_honors BOOLEAN NOT NULL DEFAULT true,
grade_class VARCHAR(64),

-- Description
description TEXT,

-- Metadata
version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_edu_personal_info ON personal_info_education (personal_info_id);

-- Child tables

-- Courses
CREATE TABLE personal_info_education_courses (
    education_id BIGINT NOT NULL REFERENCES personal_info_education (id) ON DELETE CASCADE,
    course VARCHAR(255) NOT NULL
);

CREATE INDEX idx_pi_edu_courses ON personal_info_education_courses (education_id);

-- Awards
CREATE TABLE personal_info_education_awards (
    education_id BIGINT NOT NULL REFERENCES personal_info_education (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text TEXT NOT NULL,
    PRIMARY KEY (education_id, line_order)
);

-- Projects
CREATE TABLE personal_info_education_projects (
    education_id BIGINT NOT NULL REFERENCES personal_info_education (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    title VARCHAR(255),
    url VARCHAR(1024),
    PRIMARY KEY (education_id, display_order)
);

-- Add linking support to resume educations
ALTER TABLE educations
ADD COLUMN linked_profile_education_id BIGINT REFERENCES personal_info_education (id) ON DELETE SET NULL;

CREATE INDEX idx_edu_linked_profile ON educations (linked_profile_education_id);