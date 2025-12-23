-- Personal Info Projects
CREATE TABLE personal_info_projects (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    project_type VARCHAR(32),
    role VARCHAR(32),
    short_description TEXT,
    start_date DATE,
    end_date DATE,
    currently_active BOOLEAN NOT NULL DEFAULT false,
    outcome_summary TEXT,
    downloads_count BIGINT,
    users_count BIGINT,
    stars_count BIGINT,
    revenue_impact_usd NUMERIC(19, 2),
    license_spdx VARCHAR(64),
    license_url VARCHAR(1024),
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_proj_personal_info ON personal_info_projects (personal_info_id);

-- Child tables

CREATE TABLE personal_info_project_technologies (
    project_id BIGINT NOT NULL REFERENCES personal_info_projects (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    tag VARCHAR(128) NOT NULL,
    PRIMARY KEY (project_id, tag_order)
);

CREATE TABLE personal_info_project_features (
    project_id BIGINT NOT NULL REFERENCES personal_info_projects (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text TEXT NOT NULL,
    PRIMARY KEY (project_id, line_order)
);

CREATE TABLE personal_info_project_links (
    project_id BIGINT NOT NULL REFERENCES personal_info_projects (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    link_type VARCHAR(32),
    title VARCHAR(255),
    url VARCHAR(2048),
    PRIMARY KEY (project_id, display_order)
);

CREATE TABLE personal_info_project_media (
    project_id BIGINT NOT NULL REFERENCES personal_info_projects (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    alt_text VARCHAR(255),
    thumbnail_url VARCHAR(2048),
    PRIMARY KEY (project_id, display_order)
);

-- Add linking support
ALTER TABLE projects
ADD COLUMN linked_profile_project_id BIGINT REFERENCES personal_info_projects (id) ON DELETE SET NULL;

CREATE INDEX idx_proj_linked_profile ON projects (linked_profile_project_id);