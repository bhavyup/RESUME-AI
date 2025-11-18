-- Personal Info Skill Categories
CREATE TABLE personal_info_skill_categories (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    is_predefined BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pi_skill_category_name UNIQUE (personal_info_id, name)
);

CREATE INDEX idx_pi_skill_cat_personal_info ON personal_info_skill_categories (personal_info_id);

-- Personal Info Skills
CREATE TABLE personal_info_skills (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES personal_info_skill_categories (id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    proficiency_level INTEGER NOT NULL DEFAULT 1,
    proficiency_name VARCHAR(32),
    years_of_experience INTEGER,
    last_used DATE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_skill_personal_info ON personal_info_skills (personal_info_id);

CREATE INDEX idx_pi_skill_category ON personal_info_skills (category_id);

-- Skill Keywords
CREATE TABLE personal_info_skill_keywords (
    skill_id BIGINT NOT NULL REFERENCES personal_info_skills (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    keyword VARCHAR(64) NOT NULL,
    PRIMARY KEY (skill_id, tag_order)
);

-- Personal Info Certifications (for skills)
CREATE TABLE personal_info_certifications (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES personal_info_skills (id) ON DELETE CASCADE,
    name VARCHAR(255),
    url VARCHAR(2048),
    document_url VARCHAR(2048),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_cert_skill ON personal_info_certifications (skill_id);

-- Add linking support to resume skills
ALTER TABLE skills
ADD COLUMN linked_profile_skill_id BIGINT REFERENCES personal_info_skills (id) ON DELETE SET NULL;

CREATE INDEX idx_skill_linked_profile ON skills (linked_profile_skill_id);

ALTER TABLE skill_categories
ADD COLUMN linked_profile_category_id BIGINT REFERENCES personal_info_skill_categories (id) ON DELETE SET NULL;

CREATE INDEX idx_skill_cat_linked_profile ON skill_categories (linked_profile_category_id);