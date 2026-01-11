-- UP
CREATE TABLE
    IF NOT EXISTS student_projects (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        links JSON DEFAULT NULL,
        attachments JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS student_certificates (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issue_date DATE DEFAULT NULL,
        file_path VARCHAR(1024) DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        is_verified TINYINT (1) DEFAULT 0,
        verification_notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS student_certificates;

DROP TABLE IF EXISTS student_projects;