-- UP
ALTER TABLE users
ADD COLUMN email_status ENUM ('pending', 'verified', 'failed') DEFAULT 'pending' AFTER email,
ADD COLUMN phone_status ENUM ('pending', 'verified', 'failed') DEFAULT 'pending' AFTER phone;

-- DOWN
ALTER TABLE users
DROP COLUMN email_status,
DROP COLUMN phone_status;