-- UP
CREATE TABLE
    email_change_logs (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        old_email VARCHAR(255) NOT NULL,
        new_email VARCHAR(255) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_changed_at (changed_at)
    );

-- DOWN
DROP TABLE IF EXISTS email_change_logs;