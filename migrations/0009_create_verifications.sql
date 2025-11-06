-- UP
CREATE TABLE
    IF NOT EXISTS verifications (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        user_id CHAR(36) NOT NULL,
        verified_by VARCHAR(255),
        verification_type ENUM ('institution', 'system', 'external') NOT NULL,
        verification_status ENUM ('pending', 'approved', 'rejected') DEFAULT 'pending',
        evidence_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX (user_id)
    );

-- DOWN
DROP TABLE IF EXISTS verifications;