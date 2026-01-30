-- UP
CREATE TABLE
    IF NOT EXISTS verification_pillars (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        pillar_name ENUM (
            'personal_info',
            'academic_info',
            'documents',
            'school'
        ) NOT NULL,
        weight_percentage INT DEFAULT 25,
        completion_percentage INT DEFAULT 0,
        status ENUM ('not_verified', 'in_progress', 'verified') DEFAULT 'not_verified',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_pillar (user_id, pillar_name),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
    );

CREATE TABLE
    IF NOT EXISTS verification_steps (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        pillar_id CHAR(36) NOT NULL,
        step_name VARCHAR(255) NOT NULL,
        step_order INT DEFAULT 0,
        step_type ENUM ('automatic', 'manual', 'external') DEFAULT 'automatic',
        status ENUM ('not_verified', 'pending', 'failed', 'verified') DEFAULT 'not_verified',
        status_message TEXT,
        failure_reason TEXT,
        failure_suggestion TEXT,
        requirement_checklist JSON,
        last_attempted_at DATETIME,
        verified_at DATETIME,
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        admin_reviewer_id CHAR(36),
        admin_review_notes TEXT,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (pillar_id) REFERENCES verification_pillars (id) ON DELETE CASCADE,
        FOREIGN KEY (admin_reviewer_id) REFERENCES users (id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_pillar_id (pillar_id),
        INDEX idx_status (status),
        INDEX idx_step_name (step_name)
    );

CREATE TABLE
    IF NOT EXISTS verification_step_evidence (
        id CHAR(36) NOT NULL PRIMARY KEY,
        step_id CHAR(36) NOT NULL,
        evidence_type VARCHAR(100),
        evidence_url VARCHAR(1024),
        evidence_metadata JSON,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (step_id) REFERENCES verification_steps (id) ON DELETE CASCADE,
        INDEX idx_step_id (step_id)
    );

CREATE TABLE
    IF NOT EXISTS verification_audit_log (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        step_id CHAR(36),
        action VARCHAR(255) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        performed_by_id CHAR(36),
        performed_by_type ENUM ('system', 'user', 'admin') DEFAULT 'system',
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (step_id) REFERENCES verification_steps (id) ON DELETE SET NULL,
        FOREIGN KEY (performed_by_id) REFERENCES users (id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
    );

-- DOWN
DROP TABLE IF EXISTS verification_audit_log;

DROP TABLE IF EXISTS verification_step_evidence;

DROP TABLE IF EXISTS verification_steps;

DROP TABLE IF EXISTS verification_pillars;