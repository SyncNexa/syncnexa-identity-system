-- UP
CREATE TABLE
    IF NOT EXISTS user_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX (user_id),
        INDEX (is_active),
        INDEX (expires_at)
    );

CREATE TABLE
    IF NOT EXISTS user_mfa_settings (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL UNIQUE,
        mfa_type ENUM ('totp', 'sms', 'email') NOT NULL,
        is_enabled TINYINT (1) NOT NULL DEFAULT 0,
        secret VARCHAR(255) DEFAULT NULL,
        backup_codes JSON DEFAULT NULL,
        verified_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS user_mfa_settings;

DROP TABLE IF EXISTS user_sessions;