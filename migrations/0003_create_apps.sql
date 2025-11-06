-- UP
CREATE TABLE
    NOT EXISTS apps (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID ()),
        app_name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        app_description TEXT,
        website_url VARCHAR(255),
        callback_url VARCHAR(255),
        logo_url VARCHAR(255),
        owner_id CHAR(36) NOT NULL,
        client_id CHAR(36) UNIQUE NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        scopes JSON,
        is_verified BOOLEAN DEFAULT FALSE,
        is_internal BOOLEAN DEFAULT FALSE,
        app_status ENUM ('active', 'suspended', 'revoked') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id),
        INDEX (owner_id)
    );

-- DOWN
DROP TABLE IF EXISTS apps;