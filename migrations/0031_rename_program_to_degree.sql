-- UP
ALTER TABLE students CHANGE COLUMN `program` `degree` VARCHAR(255) NULL;

-- DOWN
ALTER TABLE students CHANGE COLUMN `degree` `program` VARCHAR(255) NULL;