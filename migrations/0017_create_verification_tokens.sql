-- Up
CREATE TABLE
    IF NOT EXISTS verification_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        token TEXT NOT NULL,
        scope VARCHAR(100) DEFAULT NULL,
        issued_for BIGINT UNSIGNED DEFAULT NULL,
        issued_by BIGINT UNSIGNED DEFAULT NULL,
        expires_at DATETIME NOT NULL,
        revoked TINYINT (1) DEFAULT 0,
        metadata JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS verification_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        token_id BIGINT UNSIGNED DEFAULT NULL,
        verifier VARCHAR(255) DEFAULT NULL,
        action VARCHAR(50) NOT NULL,
        accessed_data JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (token_id) REFERENCES verification_tokens (id) ON DELETE SET NULL
    );

-- Down
DROP TABLE IF EXISTS verification_logs;

DROP TABLE IF EXISTS verification_tokens;