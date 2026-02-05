-- UP
-- Add program field for education level (undergraduate, postgraduate, secondary, etc.)
ALTER TABLE students
ADD COLUMN program ENUM (
    'secondary',
    'undergraduate',
    'postgraduate',
    'diploma',
    'certificate',
    'other'
) NULL AFTER department;

-- Rename degree to degree_name to be clearer
ALTER TABLE students CHANGE COLUMN `degree` `degree_name` VARCHAR(255) NULL;

-- Add expected_graduation_year
ALTER TABLE students
ADD COLUMN expected_graduation_year YEAR NULL AFTER admission_year;

-- DOWN
ALTER TABLE students
DROP COLUMN program,
DROP COLUMN expected_graduation_year;

ALTER TABLE students CHANGE COLUMN `degree_name` `degree` VARCHAR(255) NULL;