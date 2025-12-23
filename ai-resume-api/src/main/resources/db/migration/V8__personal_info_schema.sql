-- 1) personal_info (PK = user_id = users.id)
CREATE TABLE IF NOT EXISTS personal_info (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    professional_title VARCHAR(255),
    resume_headline VARCHAR(255),
    professional_summary TEXT,
    email VARCHAR(255),
    phone_number VARCHAR(32),
    city VARCHAR(128),
    state VARCHAR(128),
    country VARCHAR(128),
    zip VARCHAR(32),
    preferred_contact_method VARCHAR(64),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    website_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    telegram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    whatsapp_url VARCHAR(255),
    work_preference VARCHAR(32),
    photo_url VARCHAR(1024),
    version BIGINT
);

-- 2) target roles (ElementCollection)
CREATE TABLE IF NOT EXISTS personal_info_target_roles (
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pitr_personal_info ON personal_info_target_roles (personal_info_id);

-- 3) custom_links
CREATE TABLE IF NOT EXISTS custom_links (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cl_personal_info ON custom_links (personal_info_id);

-- 4) languages
CREATE TABLE IF NOT EXISTS languages (
    id BIGSERIAL PRIMARY KEY,
    language VARCHAR(64) NOT NULL,
    proficiency_level VARCHAR(32) NOT NULL,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lang_personal_info ON languages (personal_info_id);