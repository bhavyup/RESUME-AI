-- V27__add_resume_talks.sql
-- Conferences, workshops, speaking engagements ("talks") at resume level

CREATE TABLE IF NOT EXISTS resume_talks (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL, -- talk title
    event_name varchar(255) NOT NULL, -- conference/workshop name
    organizer varchar(255),
    track varchar(255),
    type varchar(16), -- TALK/WORKSHOP/PANEL/KEYNOTE/WEBINAR/POSTER/LIGHTNING/DEMO
    role varchar(16), -- SPEAKER/CO_SPEAKER/PANELIST/MODERATOR/HOST/ORGANIZER/TRAINER
    status varchar(16), -- SCHEDULED/DELIVERED/CANCELLED/POSTPONED
    start_date date,
    end_date date,
    is_virtual boolean NOT NULL DEFAULT false,
    venue varchar(255),
    city varchar(128),
    region varchar(128),
    country varchar(128),
    language varchar(64),
    audience_size integer CHECK (
        audience_size IS NULL
        OR audience_size >= 0
    ),
    slides_url varchar(2048),
    video_url varchar(2048),
    event_url varchar(2048),
    cover_image_url varchar(2048),
    abstract text,
    description text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Co-speakers (ordered)
CREATE TABLE IF NOT EXISTS resume_talk_speakers (
    talk_id bigint NOT NULL REFERENCES resume_talks (id) ON DELETE CASCADE,
    name_order integer NOT NULL,
    full_name varchar(128) NOT NULL,
    PRIMARY KEY (talk_id, name_order)
);

-- Keywords/tags (ordered)
CREATE TABLE IF NOT EXISTS resume_talk_keywords (
    talk_id bigint NOT NULL REFERENCES resume_talks (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    keyword varchar(64) NOT NULL,
    PRIMARY KEY (talk_id, tag_order)
);

-- Links (ordered)
CREATE TABLE IF NOT EXISTS resume_talk_links (
    talk_id bigint NOT NULL REFERENCES resume_talks (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    link_type varchar(16),
    title varchar(255),
    url varchar(2048),
    PRIMARY KEY (talk_id, display_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rt_resume_order ON resume_talks (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_rt_resume_start_date ON resume_talks (resume_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_rt_resume_lower_title ON resume_talks (resume_id, lower(title));

CREATE INDEX IF NOT EXISTS idx_rt_resume_lower_event ON resume_talks (resume_id, lower(event_name));