-- UP
SET @index_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = 'verification_pillars'
      AND index_name = 'idx_user_id'
);

-- only drop if it exists
SET @sql := IF(@index_exists > 0, 'ALTER TABLE verification_pillars DROP INDEX idx_user_id', 'SELECT "Index does not exist"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOWN
-- Intentionally left empty. Do NOT recreate the incorrect
-- unique index on `user_id` during rollback; the
-- (user_id, pillar_name) constraint is sufficient.
-- Note: Don't recreate the wrong constraint on rollback
-- The unique_user_pillar constraint (user_id, pillar_name) is sufficient