-- Migration: Create school_verification_audit_logs table
-- Purpose: Audit trail for all school verification activities

-- UP
CREATE TABLE IF NOT EXISTS school_verification_audit_logs (
  id CHAR(36) PRIMARY KEY,
  request_id VARCHAR(50),
  user_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  action_details TEXT,
  http_status_code INT NULL,
  error_code VARCHAR(100) NULL,
  error_message TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY idx_request_id (request_id),
  KEY idx_user_id (user_id),
  KEY idx_action (action),
  KEY idx_created_at (created_at)
);

-- DOWN
DROP TABLE IF EXISTS school_verification_audit_logs;
