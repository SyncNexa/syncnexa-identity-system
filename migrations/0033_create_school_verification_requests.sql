-- Migration: Create school_verification_requests table
-- Purpose: Track verification requests sent to schools and their status
-- UP
CREATE TABLE
    IF NOT EXISTS school_verification_requests (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        school_config_id CHAR(36) NOT NULL,
        request_id VARCHAR(50) NOT NULL UNIQUE,
        matric_number VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        status_message TEXT NULL,
        callback_url VARCHAR(500) NOT NULL,
        student_notified_at TIMESTAMP NULL,
        callback_received_at TIMESTAMP NULL,
        callback_signature_valid BOOLEAN NULL,
        verification_completed_at TIMESTAMP NULL,
        verification_outcome VARCHAR(50) NULL,
        canonical_data_json LONGTEXT NULL,
        canonical_data_hash VARCHAR(64) NULL,
        expiration_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (school_config_id) REFERENCES school_api_configs (id) ON DELETE RESTRICT,
        KEY idx_user_id (user_id),
        KEY idx_request_id (request_id),
        KEY idx_status (status),
        KEY idx_school_config_id (school_config_id),
        KEY idx_expiration_time (expiration_time)
    );

-- DOWN
DROP TABLE IF EXISTS school_verification_requests;