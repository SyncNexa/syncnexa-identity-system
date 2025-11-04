-- UP
CREATE TABLE
    IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID ()),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL UNIQUE,
        user_password VARCHAR(255) NOT NULL,
        user_country VARCHAR(100) NOT NULL,
        user_state VARCHAR(100) NOT NULL,
        user_address TEXT,
        user_gender ENUM ('male', 'female', 'custom'),
        email_verified BOOLEAN DEFAULT FALSE,
        user_profile_image VARCHAR(255)
    );

-- DOWN
DROP TABLE IF EXISTS users;