-- Personal Info Patents
CREATE TABLE personal_info_patents (
    id BIGSERIAL PRIMARY KEY,
    personal_info_id BIGINT NOT NULL REFERENCES personal_info (user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    patent_number VARCHAR(128),
    application_number VARCHAR(128),
    priority_number VARCHAR(128),
    pct_number VARCHAR(64),
    filing_date DATE,
    grant_date DATE,
    publication_date DATE,
    status VARCHAR(16),
    office VARCHAR(16),
    jurisdiction_country VARCHAR(3),
    kind_code VARCHAR(16),
    family_id VARCHAR(64),
    short_description TEXT,
    claims_summary TEXT,
    official_url VARCHAR(2048),
    version BIGINT NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pi_patent_personal_info ON personal_info_patents (personal_info_id);

CREATE INDEX idx_pi_patent_status_date ON personal_info_patents (status, grant_date);

-- Child tables

CREATE TABLE personal_info_patent_inventors (
    patent_id BIGINT NOT NULL REFERENCES personal_info_patents (id) ON DELETE CASCADE,
    name_order INTEGER NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    PRIMARY KEY (patent_id, name_order)
);

CREATE TABLE personal_info_patent_assignees (
    patent_id BIGINT NOT NULL REFERENCES personal_info_patents (id) ON DELETE CASCADE,
    name_order INTEGER NOT NULL,
    organization VARCHAR(255) NOT NULL,
    PRIMARY KEY (patent_id, name_order)
);

CREATE TABLE personal_info_patent_ipc_classes (
    patent_id BIGINT NOT NULL REFERENCES personal_info_patents (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    code VARCHAR(32) NOT NULL,
    PRIMARY KEY (patent_id, tag_order)
);

CREATE TABLE personal_info_patent_cpc_classes (
    patent_id BIGINT NOT NULL REFERENCES personal_info_patents (id) ON DELETE CASCADE,
    tag_order INTEGER NOT NULL,
    code VARCHAR(32) NOT NULL,
    PRIMARY KEY (patent_id, tag_order)
);

CREATE TABLE personal_info_patent_links (
    patent_id BIGINT NOT NULL REFERENCES personal_info_patents (id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    link_type VARCHAR(32),
    title VARCHAR(255),
    url VARCHAR(2048),
    PRIMARY KEY (patent_id, display_order)
);

-- Add linking support
ALTER TABLE patents
ADD COLUMN linked_profile_patent_id BIGINT REFERENCES personal_info_patents (id) ON DELETE SET NULL;

CREATE INDEX idx_patent_linked_profile ON patents (linked_profile_patent_id);