-- Personal Info Talks (Speaking Engagements)
CREATE TABLE personal_info_talks (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    track VARCHAR(255),
    type VARCHAR(16),
    role VARCHAR(16),
    status VARCHAR(16),
    start_date DATE,
    end_date DATE,
    is_virtual BOOLEAN NOT NULL DEFAULT false,
    venue VARCHAR(255),
    city VARCHAR(128),
    region VARCHAR(128),
    country VARCHAR(128),
    language VARCHAR(64),
    audience_size INTEGER,
    slides_url VARCHAR(2048),
    video_url VARCHAR(2048),
    event_url VARCHAR(2048),
    cover_image_url VARCHAR(2048),
    abstract TEXT,
    description TEXT,
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_talk_personal_info ON personal_info_talks (personal_info_id);

CREATE INDEX idx_pi_talk_start_date ON personal_info_talks (start_date);

-- Child tables

CREATE TABLE personal_info_talk_speakers (
    talk_id BIGINT NOT NULL REFERENCES personal_info_talks (id) ON DELETE CASCADE,
    name_order INTEGER NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (talk_id, name_order)
);

CREATE TABLE personal_info_talk_keywords (
    talk_id BIGINT NOT NULL REFERENCES personal_info_talks (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    keyword VARCHAR(64) NOT NULL,
    PRIMARY KEY (talk_id, tag_order)
);

CREATE TABLE personal_info_talk_links (
    talk_id BIGINT NOT NULL REFERENCES personal_info_talks (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    link_type VARCHAR(16),
    title VARCHAR(255),
    url VARCHAR(2048),
    PRIMARY KEY (talk_id, display_order)
);

-- Add linking support
ALTER TABLE resume_talks
ADD COLUMN linked_profile_talk_id BIGINT REFERENCES personal_info_talks (id) ON DELETE SET NULL;

CREATE INDEX idx_talk_linked_profile ON resume_talks (linked_profile_talk_id);