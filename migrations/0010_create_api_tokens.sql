-- UP
CREATE TABLE
    IF NOT EXISTS api_tokens (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        app_id CHAR(36) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NULL,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE,
        INDEX (app_id)
    );

-- DOWN
DROP TABLE IF EXISTS api_tokens;