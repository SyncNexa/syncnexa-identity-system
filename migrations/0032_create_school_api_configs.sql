-- Migration: Create school_api_configs table
-- Purpose: Store school API endpoint configuration (secrets managed separately in Vault)
-- UP
CREATE TABLE
    IF NOT EXISTS school_api_configs (
        id CHAR(36) PRIMARY KEY,
        institution_code VARCHAR(100) NOT NULL UNIQUE,
        institution_name VARCHAR(255) NOT NULL,
        api_endpoint VARCHAR(500) NOT NULL,
        vault_secret_path VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_tested_at TIMESTAMP NULL,
        test_status VARCHAR(50) NULL,
        test_message TEXT NULL,
        last_secret_rotated_at TIMESTAMP NULL,
        secret_rotation_status VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_institution_code (institution_code),
        KEY idx_is_active (is_active)
    );

-- DOWN
DROP TABLE IF EXISTS school_api_configs;