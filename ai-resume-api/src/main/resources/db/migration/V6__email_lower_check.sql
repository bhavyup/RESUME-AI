ALTER TABLE users
    ADD CONSTRAINT chk_users_email_lower
    CHECK (email = LOWER(email));