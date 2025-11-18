-- V24__add_patents.sql
-- Patents / inventions

CREATE TABLE IF NOT EXISTS patents (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    version bigint NOT NULL DEFAULT 0,
    display_order integer NOT NULL DEFAULT 0,
    title varchar(255) NOT NULL,
    patent_number varchar(128), -- e.g., US1234567B1
    application_number varchar(128), -- e.g., US16/123,456
    priority_number varchar(128), -- earliest priority (optional)
    pct_number varchar(64), -- PCT/WO number (optional)
    filing_date date,
    grant_date date,
    publication_date date,
    status varchar(16), -- FILED / PENDING / GRANTED / EXPIRED / ABANDONED / WITHDRAWN
    office varchar(16), -- USPTO / EPO / WIPO / JPO / KIPO / CNIPA / UKIPO / CIPO / INPI / DGIP / OTHER
    jurisdiction_country varchar(3), -- ISO 3166-1 alpha-2 or alpha-3
    kind_code varchar(16), -- e.g., A1, B1
    family_id varchar(64), -- patent family id (optional)
    short_description text,
    claims_summary text,
    official_url varchar(2048), -- primary link if you want a quick access
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Inventors (ordered)
CREATE TABLE IF NOT EXISTS patent_inventors (
    patent_id bigint NOT NULL REFERENCES patents (id) ON DELETE CASCADE,
    name_order integer NOT NULL,
    full_name varchar(128) NOT NULL,
    PRIMARY KEY (patent_id, name_order)
);

-- Assignees / Applicants (ordered)
CREATE TABLE IF NOT EXISTS patent_assignees (
    patent_id bigint NOT NULL REFERENCES patents (id) ON DELETE CASCADE,
    name_order integer NOT NULL,
    organization varchar(255) NOT NULL,
    PRIMARY KEY (patent_id, name_order)
);

-- Classifications (IPC)
CREATE TABLE IF NOT EXISTS patent_ipc_classes (
    patent_id bigint NOT NULL REFERENCES patents (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    code varchar(32) NOT NULL,
    PRIMARY KEY (patent_id, tag_order)
);

-- Classifications (CPC)
CREATE TABLE IF NOT EXISTS patent_cpc_classes (
    patent_id bigint NOT NULL REFERENCES patents (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    code varchar(32) NOT NULL,
    PRIMARY KEY (patent_id, tag_order)
);

-- External links (ordered)
CREATE TABLE IF NOT EXISTS patent_links (
    patent_id bigint NOT NULL REFERENCES patents (id) ON DELETE CASCADE,
    display_order integer NOT NULL,
    link_type varchar(32), -- OFFICIAL / GOOGLE_PATENTS / ESPACENET / PDF / OTHER
    title varchar(255),
    url varchar(2048),
    PRIMARY KEY (patent_id, display_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patents_resume_order ON patents (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_patents_resume_status_date ON patents (resume_id, status, grant_date);

CREATE INDEX IF NOT EXISTS idx_patents_patent_number ON patents (patent_number);

CREATE INDEX IF NOT EXISTS idx_patents_application_number ON patents (application_number);

CREATE INDEX IF NOT EXISTS idx_patents_lower_title ON patents (resume_id, lower(title));