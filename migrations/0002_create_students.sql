-- UP
CREATE TABLE
    IF NOT EXISTS students (
        user_id CHAR(36) PRIMARY KEY,
        institution VARCHAR(255) NOT NULL,
        matric_number VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(255),
        faculty VARCHAR(255),
        course VARCHAR(255),
        student_level VARCHAR(50),
        graduation_year YEAR,
        is_institution_verified BOOLEAN DEFAULT FALSE,
        verification_date TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS students;