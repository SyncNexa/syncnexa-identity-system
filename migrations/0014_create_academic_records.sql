-- UP
CREATE TABLE
    IF NOT EXISTS academic_records (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        program VARCHAR(255) DEFAULT NULL,
        matric_number VARCHAR(100) DEFAULT NULL,
        start_date DATE DEFAULT NULL,
        end_date DATE DEFAULT NULL,
        degree VARCHAR(255) DEFAULT NULL,
        gpa VARCHAR(50) DEFAULT NULL,
        meta JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS transcripts (
        id CHAR(36) NOT NULL PRIMARY KEY,
        academic_record_id CHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(1024) DEFAULT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        file_size BIGINT DEFAULT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified TINYINT (1) DEFAULT 0,
        verification_notes TEXT DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        FOREIGN KEY (academic_record_id) REFERENCES academic_records (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS transcripts;

DROP TABLE IF EXISTS academic_records;