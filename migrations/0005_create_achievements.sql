-- UP
CREATE TABLE
    IF NOT EXISTS student_achievements (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        archievement_description TEXT,
        category VARCHAR(100),
        awarded_by VARCHAR(255),
        awarded_date DATE,
        verified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        INDEX (user_id)
    );

-- DOWN
DROP TABLE IF EXISTS student_achievements;