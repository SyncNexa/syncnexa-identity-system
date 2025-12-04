-- Up
ALTER TABLE users MODIFY COLUMN user_role ENUM ('student', 'developer', 'staff', 'visitor') NOT NULL DEFAULT 'student';

-- Down
ALTER TABLE users MODIFY COLUMN user_role ENUM ('student', 'developer', 'staff') NOT NULL DEFAULT 'student';