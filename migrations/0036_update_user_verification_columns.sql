-- UP
ALTER TABLE users CHANGE COLUMN is_verified email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;

-- DOWN
ALTER TABLE users CHANGE COLUMN email_verified is_verified BOOLEAN DEFAULT FALSE,
DROP COLUMN phone_verified;