-- V31__resume_chunks.sql
-- Chunks of resume text for semantic retrieval (RAG)
CREATE TABLE IF NOT EXISTS resume_chunks (
    id bigserial PRIMARY KEY,
    resume_id bigint NOT NULL REFERENCES resumes (id) ON DELETE CASCADE,
    section varchar(32) NOT NULL, -- EXPERIENCE/PROJECT/SUMMARY/SKILL/EDUCATION/OTHER
    ref_type varchar(32), -- e.g., EXPERIENCE_BULLET, PROJECT_SUMMARY
    ref_id bigint, -- points to entity id when applicable (experienceId, projectId)
    part_order integer NOT NULL, -- order within a section/ref
    content text NOT NULL, -- the actual chunk text
    embedding vector (768), -- nomic-embed-text (768 dims)
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rc_resume ON resume_chunks (resume_id);
-- HNSW for vector cosine search (requires pgvector >= 0.5.0)
CREATE INDEX IF NOT EXISTS idx_rc_hnsw ON resume_chunks USING hnsw (embedding vector_cosine_ops);