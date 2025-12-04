-- UP
ALTER TABLE users MODIFY COLUMN user_role ENUM ('student', 'developer', 'staff', 'visitor') NOT NULL DEFAULT 'student';

-- DOWN
ALTER TABLE users MODIFY COLUMN user_role ENUM ('student', 'developer', 'staff') NOT NULL DEFAULT 'student';