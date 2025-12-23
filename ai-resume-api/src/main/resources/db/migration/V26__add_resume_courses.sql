-- V26__add_resume_courses.sql
-- Courses & trainings (outside formal education)

CREATE TABLE IF NOT EXISTS resume_courses (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL,
    provider varchar(255) NOT NULL, -- org issuing the course
    platform varchar(128), -- Coursera, Udemy, edX...
    start_date date,
    end_date date,
    completion_date date,
    hours numeric(6, 2), -- total learning hours (optional)
    credential_id varchar(128),
    credential_url varchar(2048),
    certificate_url varchar(2048),
    grade varchar(64),
    score numeric(10, 2),
    score_unit varchar(32),
    level varchar(16), -- BEGINNER / INTERMEDIATE / ADVANCED / EXPERT
    delivery_mode varchar(16), -- ONLINE / OFFLINE / BLENDED
    status varchar(16), -- COMPLETED / IN_PROGRESS / PLANNED / EXPIRED
    description text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Instructors (ordered)
CREATE TABLE IF NOT EXISTS resume_course_instructors (
    course_id bigint NOT NULL REFERENCES resume_courses (id) ON DELETE CASCADE,
    name_order integer NOT NULL,
    full_name varchar(128) NOT NULL,
    PRIMARY KEY (course_id, name_order)
);

-- Topics / syllabus (ordered)
CREATE TABLE IF NOT EXISTS resume_course_topics (
    course_id bigint NOT NULL REFERENCES resume_courses (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text varchar(255) NOT NULL,
    PRIMARY KEY (course_id, line_order)
);

-- External links (ordered)
CREATE TABLE IF NOT EXISTS resume_course_links (
    course_id bigint NOT NULL REFERENCES resume_courses (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    link_type varchar(16), -- SYLLABUS / PROJECT / REPO / CERTIFICATE / OTHER
    title varchar(255),
    url varchar(2048),
    PRIMARY KEY (course_id, display_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rcourse_resume_order ON resume_courses (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_rcourse_resume_completion ON resume_courses (
    resume_id,
    completion_date DESC
);

CREATE INDEX IF NOT EXISTS idx_rcourse_lower_title ON resume_courses (resume_id, lower(title));