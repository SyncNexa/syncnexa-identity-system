-- UP
CREATE TABLE
    IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        user_country VARCHAR(100),
        user_state VARCHAR(100),
        user_address TEXT,
        gender ENUM ('male', 'female', 'custom'),
        is_verified BOOLEAN DEFAULT FALSE,
        profile_image VARCHAR(255),
        user_role ENUM ('student', 'developer', 'staff') NOT NULL DEFAULT 'student',
        account_status ENUM ('active', 'suspended', 'deactivated') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email)
    );

-- DOWN
DROP TABLE IF EXISTS users;