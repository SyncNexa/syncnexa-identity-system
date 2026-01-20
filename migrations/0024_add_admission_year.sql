-- Add admission_year column to students table
-- Keeps graduation_year nullable for backward compatibility; application now requires both
-- UP
ALTER TABLE students
ADD COLUMN admission_year YEAR NULL AFTER student_level;

-- DOWN
ALTER TABLE students
DROP COLUMN admission_year;