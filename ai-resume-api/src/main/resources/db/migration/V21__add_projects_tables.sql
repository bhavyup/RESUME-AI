-- V21__add_projects_tables.sql
-- Projects + child collections (tags, features, links, media)

CREATE TABLE IF NOT EXISTS projects (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL,
    project_type varchar(32), -- PERSONAL / ACADEMIC / OPEN_SOURCE / FREELANCE / COLLABORATIVE
    role varchar(32), -- LEAD_DEV / DATA_SCIENTIST / PM / DESIGNER / ENGINEER / QA / DEVOPS / OTHER
    short_description text,
    start_date date,
    end_date date,
    currently_active boolean NOT NULL DEFAULT false,
    outcome_summary text, -- optional narrative for outcome
    downloads_count bigint,
    users_count bigint,
    stars_count bigint,
    revenue_impact_usd numeric(19, 2),
    license_spdx varchar(64), -- e.g., MIT, Apache-2.0
    license_url varchar(1024),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tech stack tags (ordered)
CREATE TABLE IF NOT EXISTS project_technologies (
    project_id bigint NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    tag varchar(128) NOT NULL,
    PRIMARY KEY (project_id, tag_order)
);

-- Features / responsibilities (ordered)
CREATE TABLE IF NOT EXISTS project_features (
    project_id bigint NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    line_order integer NOT NULL,
    line_text text NOT NULL,
    PRIMARY KEY (project_id, line_order)
);

-- Links (ordered)
CREATE TABLE IF NOT EXISTS project_links (
    project_id bigint NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    link_type varchar(32), -- REPO / DEMO / LIVE / CASE_STUDY / VIDEO / DOCS / OTHER
    title varchar(255),
    url varchar(2048),
    PRIMARY KEY (project_id, display_order)
);

-- Media (screenshots/thumbnails) (ordered)
CREATE TABLE IF NOT EXISTS project_media (
    project_id bigint NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    image_url varchar(2048) NOT NULL,
    alt_text varchar(255),
    thumbnail_url varchar(2048),
    PRIMARY KEY (project_id, display_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_resume_order ON projects (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_projects_resume_typedate ON projects (
    resume_id,
    project_type,
    start_date
);

CREATE INDEX IF NOT EXISTS idx_projects_lower_title ON projects (resume_id, lower(title));