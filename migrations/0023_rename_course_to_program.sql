-- UP
ALTER TABLE students CHANGE COLUMN `course` `program` VARCHAR(255) NULL;

-- DOWN
ALTER TABLE students CHANGE COLUMN `program` `course` VARCHAR(255) NULL;