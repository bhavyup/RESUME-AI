-- V23__add_publications.sql
-- Publications / research / academic outputs


CREATE TABLE IF NOT EXISTS publications (
  id                    bigserial PRIMARY KEY,
  resume_id             bigint NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version               bigint NOT NULL DEFAULT 0,
  display_order         integer NOT NULL DEFAULT 0,

  title                 varchar(512) NOT NULL,
  publication_type      varchar(32),        -- JOURNAL / CONFERENCE / PREPRINT / BOOK / CHAPTER / ARTICLE / PATENT / THESIS / REPORT / OTHER
  status                varchar(32),        -- PUBLISHED / ACCEPTED / IN_REVIEW / SUBMITTED / DRAFT / REJECTED
  venue                 varchar(255),       -- journal/conference/publisher
  publisher             varchar(255),

  date_year_month       varchar(16),        -- "YYYY" or "YYYY-MM"
  peer_reviewed         boolean NOT NULL DEFAULT false,

-- Identifiers
doi varchar(255),
arxiv_id varchar(64),
ssrn_id varchar(64),
pubmed_id varchar(64),
isbn varchar(32),
url varchar(2048),

-- Content
abstract_text text, summary varchar(512),

-- Citations/metrics
citation_count integer,

-- Presentation (talk/poster) info
presentation_title varchar(255),
presentation_type varchar(16), -- TALK / POSTER / KEYNOTE
event_name varchar(255),
event_location_city varchar(128),
event_location_country varchar(128),
presentation_date date,

-- Optional pagination metadata
volume                varchar(64),
  issue                 varchar(64),
  pages                 varchar(64),

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Authors (ordered)
CREATE TABLE IF NOT EXISTS publication_authors (
    publication_id bigint NOT NULL REFERENCES publications (id) ON DELETE CASCADE,
    author_order integer NOT NULL,
    full_name varchar(128) NOT NULL,
    PRIMARY KEY (publication_id, author_order)
);

-- Keywords (ordered)
CREATE TABLE IF NOT EXISTS publication_keywords (
    publication_id bigint NOT NULL REFERENCES publications (id) ON DELETE CASCADE,
    tag_order integer NOT NULL,
    keyword varchar(64) NOT NULL,
    PRIMARY KEY (publication_id, tag_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_publications_resume_order ON publications (resume_id, display_order);

CREATE INDEX IF NOT EXISTS idx_publications_resume_date ON publications (resume_id, date_year_month);

CREATE INDEX IF NOT EXISTS idx_publications_resume_type ON publications (resume_id, publication_type);

CREATE INDEX IF NOT EXISTS idx_publications_doi ON publications (doi);

CREATE INDEX IF NOT EXISTS idx_publications_lower_title ON publications (resume_id, lower(title));