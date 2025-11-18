-- Normalize data
UPDATE users SET email = LOWER(email);

-- Create a functional unique index on lower(email)
CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email_lower ON users (LOWER(email));

-- Optional: drop the existing unique constraint if it conflicts (be careful)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_users_email;