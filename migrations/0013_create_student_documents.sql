-- UP
CREATE TABLE
    IF NOT EXISTS student_documents (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(1024) DEFAULT NULL,
        mime_type VARCHAR(100) DEFAULT NULL,
        file_size BIGINT DEFAULT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified TINYINT (1) DEFAULT 0,
        verification_id BIGINT UNSIGNED DEFAULT NULL,
        meta JSON DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS student_document_verifications (
        id CHAR(36) NOT NULL PRIMARY KEY,
        document_id CHAR(36) NOT NULL,
        reviewer_id CHAR(36) DEFAULT NULL,
        document_status ENUM ('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        notes TEXT DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES student_documents (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS student_document_verifications;

DROP TABLE IF EXISTS student_documents;