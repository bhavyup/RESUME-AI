package com.resumebuilder.ai_resume_api.repository.vector;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;

@Repository
public class ResumeChunkDao {

    private final JdbcTemplate jdbc;

    public ResumeChunkDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void deleteByResumeId(Long resumeId) {
        jdbc.update("DELETE FROM resume_chunks WHERE resume_id = ?", resumeId);
    }

    public void insert(Long resumeId, String section, String refType, Long refId, int partOrder, String content,
            float[] embedding) {
        // Pass vector as text literal '[..]' and cast to ::vector
        String vec = toVectorLiteral(embedding);
        String sql = """
                INSERT INTO resume_chunks (resume_id, section, ref_type, ref_id, part_order, content, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?::vector)
                """;
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setLong(1, resumeId);
            ps.setString(2, section);
            ps.setString(3, refType);
            if (refId == null)
                ps.setNull(4, java.sql.Types.BIGINT);
            else
                ps.setLong(4, refId);
            ps.setInt(5, partOrder);
            ps.setString(6, content);
            ps.setString(7, vec);
            return ps;
        });
    }

    public List<Map<String, Object>> topK(float[] queryEmbedding, int k) {
        String vec = toVectorLiteral(queryEmbedding);
        String sql = """
                SELECT id, resume_id, section, ref_type, ref_id, part_order, content,
                       (embedding <=> ?::vector) AS distance
                FROM resume_chunks
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;
        return jdbc.queryForList(sql, vec, vec, k);
    }

    private String toVectorLiteral(float[] vec) {
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < vec.length; i++) {
            if (i > 0)
                sb.append(',');
            sb.append(Float.toString(vec[i]));
        }
        sb.append(']');
        return sb.toString();
    }

    // in com.resumebuilder.ai_resume_api.repository.vector.ResumeChunkDao

    public List<BulletRow> findExperienceBullets(Long resumeId, Long experienceId) {
        String sql = """
                SELECT part_order, content
                FROM resume_chunks
                WHERE resume_id = ?
                  AND section = 'EXPERIENCE'
                  AND ref_id = ?
                  AND ref_type IN ('EXPERIENCE_BULLET','EXPERIENCE_ACHIEVEMENT')
                ORDER BY part_order ASC
                """;
        return jdbc.query(sql, (rs, rowNum) -> new BulletRow(
                ((Number) rs.getObject("part_order")).intValue(),
                rs.getString("content")), resumeId, experienceId);
    }

    public Integer maxExperienceBulletOrder(Long resumeId, Long experienceId) {
        String sql = """
                SELECT COALESCE(MAX(part_order), -1) AS max_po
                FROM resume_chunks
                WHERE resume_id = ?
                  AND section = 'EXPERIENCE'
                  AND ref_id = ?
                  AND ref_type IN ('EXPERIENCE_BULLET','EXPERIENCE_ACHIEVEMENT')
                """;
        Integer max = jdbc.queryForObject(sql, (rs, rowNum) -> {
            Number n = (Number) rs.getObject("max_po");
            return n == null ? -1 : n.intValue();
        }, resumeId, experienceId);
        return max;
    }

    public Integer maxExperienceResponsibilityOrder(Long resumeId, Long experienceId) {
        String sql = """
                SELECT COALESCE(MAX(part_order), -1) AS max_po
                FROM resume_chunks
                WHERE resume_id = ?
                AND section = 'EXPERIENCE'
                AND ref_id = ?
                AND ref_type = 'EXPERIENCE_BULLET'
                """;
        Integer max = jdbc.queryForObject(sql, (rs, rowNum) -> {
            Number n = (Number) rs.getObject("max_po");
            return n == null ? -1 : n.intValue();
        }, resumeId, experienceId);
        return max;
    }

    // typed row for clarity
    public static record BulletRow(int partOrder, String content) {
    }
}