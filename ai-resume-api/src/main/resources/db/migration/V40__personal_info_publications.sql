-- Personal Info Publications

CREATE TABLE personal_info_publications (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info(user_id) ON DELETE CASCADE,
    
    title VARCHAR(512) NOT NULL,
    publication_type VARCHAR(32),
    status VARCHAR(32),
    venue VARCHAR(255),
    publisher VARCHAR(255),
    date_year_month VARCHAR(16),
    peer_reviewed BOOLEAN NOT NULL DEFAULT false,

-- Identifiers
doi VARCHAR(255),
arxiv_id VARCHAR(64),
ssrn_id VARCHAR(64),
pubmed_id VARCHAR(64),
isbn VARCHAR(32),
url VARCHAR(2048),

-- Content
abstract_text TEXT,
summary VARCHAR(512),
citation_count INTEGER,

-- Presentation
presentation_title VARCHAR(255),
presentation_type VARCHAR(16),
event_name VARCHAR(255),
event_location_city VARCHAR(128),
event_location_country VARCHAR(128),
presentation_date DATE,

-- Pagination
volume VARCHAR(64),
    issue VARCHAR(64),
    pages VARCHAR(64),
    
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_pub_personal_info ON personal_info_publications (personal_info_id);

CREATE INDEX idx_pi_pub_type ON personal_info_publications (publication_type);

-- Child tables

CREATE TABLE personal_info_publication_authors (
    publication_id BIGINT NOT NULL REFERENCES personal_info_publications (id) ON DELETE CASCADE,
    author_order INTEGER NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (publication_id, author_order)
);

CREATE TABLE personal_info_publication_keywords (
    publication_id BIGINT NOT NULL REFERENCES personal_info_publications (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    keyword VARCHAR(64) NOT NULL,
    PRIMARY KEY (publication_id, tag_order)
);

-- Add linking support
ALTER TABLE publications
ADD COLUMN linked_profile_publication_id BIGINT REFERENCES personal_info_publications (id) ON DELETE SET NULL;

CREATE INDEX idx_pub_linked_profile ON publications (linked_profile_publication_id);