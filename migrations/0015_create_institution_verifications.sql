-- Up
CREATE TABLE
    IF NOT EXISTS institution_verification_requests (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        institution VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) DEFAULT NULL,
        contact_phone VARCHAR(100) DEFAULT NULL,
        payload JSON DEFAULT NULL,
        status ENUM ('pending', 'requested', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Down
DROP TABLE IF EXISTS institution_verification_requests;