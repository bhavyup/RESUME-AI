-- Personal Info Courses
CREATE TABLE personal_info_courses (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    platform VARCHAR(128),
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    hours NUMERIC(6, 2),
    credential_id VARCHAR(128),
    credential_url VARCHAR(2048),
    certificate_url VARCHAR(2048),
    grade VARCHAR(64),
    score NUMERIC(10, 2),
    score_unit VARCHAR(32),
    level VARCHAR(16),
    delivery_mode VARCHAR(16),
    status VARCHAR(16),
    description TEXT,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_course_personal_info ON personal_info_courses (personal_info_id);

-- Child tables

CREATE TABLE personal_info_course_instructors (
    course_id BIGINT NOT NULL REFERENCES personal_info_courses (id) ON DELETE CASCADE,
    name_order INTEGER NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (course_id, name_order)
);

CREATE TABLE personal_info_course_topics (
    course_id BIGINT NOT NULL REFERENCES personal_info_courses (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, line_order)
);

CREATE TABLE personal_info_course_links (
    course_id BIGINT NOT NULL REFERENCES personal_info_courses (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    link_type VARCHAR(16),
    title VARCHAR(255),
    url VARCHAR(2048),
    PRIMARY KEY (course_id, display_order)
);

-- Add linking support
ALTER TABLE resume_courses
ADD COLUMN linked_profile_course_id BIGINT REFERENCES personal_info_courses (id) ON DELETE SET NULL;

CREATE INDEX idx_course_linked_profile ON resume_courses (linked_profile_course_id);