CREATE TABLE IF NOT EXISTS languages (
id BIGSERIAL PRIMARY KEY,
language VARCHAR(64) NOT NULL,
proficiency_level VARCHAR(32) NOT NULL,
personal_info_id BIGINT NOT NULL REFERENCES personal_info(user_id) ON DELETE CASCADE
);

INSERT INTO languages (id, language, proficiency_level, personal_info_id)
SELECT id, language, proficiency_level, personal_info_id
FROM language_proficiencies
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS language_proficiencies;