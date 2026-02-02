-- Migration: Create school_verification_matches table
-- Purpose: Track field-by-field matching results between student claims and canonical data

-- UP
CREATE TABLE IF NOT EXISTS school_verification_matches (
  id CHAR(36) PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  student_claimed VARCHAR(255),
  school_returned VARCHAR(255) NOT NULL,
  match_result VARCHAR(50) NOT NULL,
  match_score DECIMAL(3, 2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (request_id) REFERENCES school_verification_requests (request_id) ON DELETE CASCADE,
  
  KEY idx_request_id (request_id),
  KEY idx_field_name (field_name),
  KEY idx_match_result (match_result),
  UNIQUE KEY unique_request_field (request_id, field_name)
);

-- DOWN
DROP TABLE IF EXISTS school_verification_matches;
