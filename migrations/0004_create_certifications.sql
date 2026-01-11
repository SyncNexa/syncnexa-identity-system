-- UP
CREATE TABLE
    IF NOT EXISTS student_certifications (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255),
        issue_date DATE,
        cert_expiry_date DATE,
        credential_id VARCHAR(255),
        credential_url VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX (user_id)
    );

-- DOWN
DROP TABLE IF EXISTS student_certifications;