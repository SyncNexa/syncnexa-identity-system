-- UP
CREATE TABLE
    IF NOT EXISTS verification_tokens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        token TEXT NOT NULL,
        scope VARCHAR(100) DEFAULT NULL,
        issued_for CHAR(36) DEFAULT NULL,
        issued_by CHAR(36) DEFAULT NULL,
        expires_at DATETIME NOT NULL,
        revoked TINYINT (1) DEFAULT 0,
        metadata JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS verification_logs (
        id CHAR(36) NOT NULL PRIMARY KEY,
        token_id CHAR(36) DEFAULT NULL,
        verifier VARCHAR(255) DEFAULT NULL,
        action VARCHAR(50) NOT NULL,
        accessed_data JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (token_id) REFERENCES verification_tokens (id) ON DELETE SET NULL
    );

-- DOWN
DROP TABLE IF EXISTS verification_logs;

DROP TABLE IF EXISTS verification_tokens;