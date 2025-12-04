-- UP
CREATE TABLE
    IF NOT EXISTS refresh_tokens (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID ()),
        user_id CHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS refresh_tokens;