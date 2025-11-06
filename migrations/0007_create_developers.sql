-- UP
CREATE TABLE
    IF NOT EXISTS developers (
        user_id CHAR(36) PRIMARY KEY,
        organization_name VARCHAR(255),
        website_url VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS developers;