ALTER TABLE users
    ADD CONSTRAINT chk_users_username_format
    CHECK (username ~ '^[a-z0-9._-]{3,32}$');