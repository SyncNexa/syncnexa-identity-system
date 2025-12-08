-- UP
CREATE TABLE
    IF NOT EXISTS student_cards (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID ()),
        user_id CHAR(36) NOT NULL,
        card_uuid VARCHAR(100) NOT NULL UNIQUE,
        meta JSON DEFAULT NULL,
        is_active TINYINT (1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS student_card_tokens (
        id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID ()),
        card_id CHAR(36) NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        used_at DATETIME DEFAULT NULL,
        used_by VARCHAR(255) DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        FOREIGN KEY (card_id) REFERENCES student_cards (id) ON DELETE CASCADE
    );

-- DOWN
DROP TABLE IF EXISTS student_card_tokens;

DROP TABLE IF EXISTS student_cards;