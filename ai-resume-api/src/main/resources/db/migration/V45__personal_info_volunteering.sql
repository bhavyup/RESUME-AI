-- Personal Info Volunteering
CREATE TABLE personal_info_volunteering (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    type VARCHAR(16),
    status VARCHAR(16),
    engagement_mode VARCHAR(16),
    cause VARCHAR(32),
    start_date DATE,
    end_date DATE,
    hours NUMERIC(10, 2),
    city VARCHAR(128),
    region VARCHAR(128),
    country VARCHAR(128),
    org_website_url VARCHAR(2048),
    cover_image_url VARCHAR(2048),
    description TEXT,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_vol_personal_info ON personal_info_volunteering (personal_info_id);

CREATE INDEX idx_pi_vol_start_date ON personal_info_volunteering (start_date);

-- Child tables

CREATE TABLE personal_info_volunteer_responsibilities (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

CREATE TABLE personal_info_volunteer_impacts (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

CREATE TABLE personal_info_volunteer_mentees (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    name_order INTEGER NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (volunteering_id, name_order)
);

CREATE TABLE personal_info_volunteer_events (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

CREATE TABLE personal_info_volunteer_teaching_topics (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    line_order INTEGER NOT NULL,
    line_text VARCHAR(128) NOT NULL,
    PRIMARY KEY (volunteering_id, line_order)
);

CREATE TABLE personal_info_volunteer_keywords (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    keyword VARCHAR(64) NOT NULL,
    PRIMARY KEY (volunteering_id, tag_order)
);

CREATE TABLE personal_info_volunteer_reference_urls (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    url_order INTEGER NOT NULL,
    url VARCHAR(2048) NOT NULL,
    PRIMARY KEY (volunteering_id, url_order)
);

CREATE TABLE personal_info_volunteer_links (
    volunteering_id BIGINT NOT NULL REFERENCES personal_info_volunteering (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    link_type VARCHAR(16),
    title VARCHAR(255),
    url VARCHAR(2048),
    PRIMARY KEY (
        volunteering_id,
        display_order
    )
);

-- Add linking support
ALTER TABLE resume_volunteering
ADD COLUMN linked_profile_volunteering_id BIGINT REFERENCES personal_info_volunteering (id) ON DELETE SET NULL;

CREATE INDEX idx_vol_linked_profile ON resume_volunteering (
    linked_profile_volunteering_id
);