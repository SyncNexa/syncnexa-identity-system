-- Migration: Create school_api_configs table
-- Purpose: Store school API endpoints, credentials, and configuration
-- UP
CREATE TABLE
    IF NOT EXISTS school_api_configs (
        id CHAR(36) PRIMARY KEY,
        institution_code VARCHAR(100) NOT NULL UNIQUE,
        institution_name VARCHAR(255) NOT NULL,
        api_endpoint VARCHAR(500) NOT NULL,
        api_token VARCHAR(255) NOT NULL,
        hmac_secret VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_tested_at TIMESTAMP NULL,
        test_status VARCHAR(50) NULL,
        test_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_institution_code (institution_code),
        KEY idx_is_active (is_active)
    );

-- DOWN
DROP TABLE IF EXISTS school_api_configs;