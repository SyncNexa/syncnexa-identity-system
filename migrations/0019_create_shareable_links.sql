-- UP
CREATE TABLE
    IF NOT EXISTS shareable_links (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID ()),
        user_id CHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        resource_type VARCHAR(100) NOT NULL,
        resource_id CHAR(36) NULL,
        scope JSON DEFAULT NULL,
        expires_at DATETIME NULL,
        max_uses INT UNSIGNED NULL,
        uses_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_revoked TINYINT (1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS shareable_links;