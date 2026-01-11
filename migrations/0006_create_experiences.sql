-- UP
CREATE TABLE
    IF NOT EXISTS student_experiences (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        role_title VARCHAR(255),
        organization VARCHAR(255),
        exp_start_date DATE,
        end_date DATE,
        exp_description TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX (user_id)
    );

-- DOWN
DROP TABLE IF EXISTS student_experiences;