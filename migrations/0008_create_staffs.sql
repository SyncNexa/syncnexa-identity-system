-- UP
CREATE TABLE
    IF NOT EXISTS staffs (
        user_id CHAR(36) PRIMARY KEY,
        position VARCHAR(100),
        department VARCHAR(100),
        permissions JSON,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS staffs;