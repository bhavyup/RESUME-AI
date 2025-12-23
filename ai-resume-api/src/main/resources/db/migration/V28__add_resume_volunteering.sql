-- V28__add_resume_volunteering.sql
-- Volunteer work, leadership & community / pro-bono

CREATE TABLE IF NOT EXISTS resume_volunteering (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL, -- Role / title
    organization varchar(255) NOT NULL,
    type varchar(16), -- VOLUNTEER/LEADERSHIP/MENTORING/ORGANIZING/TEACHING/TUTORING/COACHING/PRO_BONO/COMMUNITY
    status varchar(16), -- ONGOING/COMPLETED/PLANNED/PAUSED
    engagement_mode varchar(16), -- IN_PERSON/VIRTUAL/HYBRID
    cause varchar(32), -- EDUCATION/ENVIRONMENT/HEALTH/...
    start_date date,
    end_date date,
    hours numeric(10, 2) CHECK (
        hours IS NULL
        OR hours >= 0
    ),
    city varchar(128),
    region varchar(128),
    country varchar(128),
    org_website_url varchar(2048),
    cover_image_url varchar(2048),
    description text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Responsibilities (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_responsibilities (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text varchar(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

-- Impacts/outcomes (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_impacts (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text varchar(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

-- Mentees (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_mentees (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    name_order integer NOT NULL,
    full_name varchar(128) NOT NULL,
    PRIMARY KEY (volunteering_id, name_order)
);

-- Events organized (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_events (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text varchar(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

-- Teaching/tutoring topics (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_teaching_topics (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text varchar(128) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

-- Keywords/tags (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_keywords (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    keyword varchar(64) NOT NULL,
    PRIMARY KEY (volunteering_id, tag_order)
);

-- Reference URLs (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_reference_urls (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    url_order integer NOT NULL,
    url varchar(2048) NOT NULL,
    PRIMARY KEY (volunteering_id, url_order)
);

-- Links (ordered)
CREATE TABLE IF NOT EXISTS resume_volunteer_links (
    volunteering_id bigint NOT NULL REFERENCES resume_volunteering (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    link_type varchar(16),
    title varchar(255),
    url varchar(2048),
    PRIMARY KEY (
        volunteering_id,
        display_order
    )
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rvol_resume_order ON resume_volunteering (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_rvol_resume_start_date ON resume_volunteering (resume_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_rvol_resume_lower_title ON resume_volunteering (resume_id, lower(title));

CREATE INDEX IF NOT EXISTS idx_rvol_resume_lower_org ON resume_volunteering (
    resume_id,
    lower(organization)
);