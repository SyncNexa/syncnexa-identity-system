-- UP
ALTER TABLE user_sessions
ADD COLUMN device_name VARCHAR(255) DEFAULT NULL AFTER user_agent;

ALTER TABLE user_sessions
ADD COLUMN browser VARCHAR(100) DEFAULT NULL AFTER device_name;

ALTER TABLE user_sessions
ADD COLUMN device_type ENUM ('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown' AFTER browser;

ALTER TABLE user_sessions
ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER device_type;

ALTER TABLE user_sessions ADD INDEX idx_user_id_active (user_id, is_active);

-- DOWN
ALTER TABLE user_sessions
DROP INDEX idx_user_id_active;

ALTER TABLE user_sessions
DROP COLUMN location;

ALTER TABLE user_sessions
DROP COLUMN device_type;

ALTER TABLE user_sessions
DROP COLUMN browser;

ALTER TABLE user_sessions
DROP COLUMN device_name;