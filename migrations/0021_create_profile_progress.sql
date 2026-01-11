-- UP
CREATE TABLE
    IF NOT EXISTS profile_progress (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL UNIQUE,
        documents_count INT UNSIGNED DEFAULT 0,
        documents_verified INT UNSIGNED DEFAULT 0,
        academics_count INT UNSIGNED DEFAULT 0,
        transcripts_count INT UNSIGNED DEFAULT 0,
        institution_verifications_count INT UNSIGNED DEFAULT 0,
        institution_verified INT UNSIGNED DEFAULT 0,
        projects_count INT UNSIGNED DEFAULT 0,
        certificates_count INT UNSIGNED DEFAULT 0,
        certificates_verified INT UNSIGNED DEFAULT 0,
        has_student_card TINYINT (1) DEFAULT 0,
        has_mfa_enabled TINYINT (1) DEFAULT 0,
        profile_completion_percent INT UNSIGNED DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS profile_progress;