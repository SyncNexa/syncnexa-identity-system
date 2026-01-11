-- UP
CREATE TABLE
    IF NOT EXISTS app_grants (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        app_id CHAR(36) NOT NULL,
        scopes JSON DEFAULT NULL,
        access_token VARCHAR(255) UNIQUE,
        refresh_token VARCHAR(255) UNIQUE,
        token_expires_at DATETIME,
        is_revoked TINYINT (1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE,
        INDEX (user_id),
        INDEX (app_id),
        INDEX (access_token)
    );

CREATE TABLE
    IF NOT EXISTS authorization_codes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        app_id CHAR(36) NOT NULL,
        code VARCHAR(255) UNIQUE NOT NULL,
        scopes JSON DEFAULT NULL,
        redirect_uri VARCHAR(1024),
        is_used TINYINT (1) DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE,
        INDEX (code),
        INDEX (user_id),
        INDEX (app_id)
    );

-- DOWN
DROP TABLE IF EXISTS authorization_codes;

DROP TABLE IF EXISTS app_grants;