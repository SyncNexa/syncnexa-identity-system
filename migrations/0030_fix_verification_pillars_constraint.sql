-- Fix verification_pillars table to allow multiple pillars per user
-- Remove the incorrect UNIQUE constraint on user_id
-- The correct constraint (user_id, pillar_name) already exists
-- UP
-- Only drop the index if it exists to avoid errors on environments
-- where the index was already removed or never created.
SET @idx_exists = (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.STATISTICS s
	WHERE s.TABLE_SCHEMA = DATABASE()
		AND s.TABLE_NAME = 'verification_pillars'
		AND s.INDEX_NAME = 'user_id'
);
SET @sql = IF(@idx_exists > 0,
	'ALTER TABLE verification_pillars DROP INDEX `user_id`;',
	'SELECT "no_index_to_drop";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOWN
-- Note: Don't recreate the wrong constraint on rollback
-- The unique_user_pillar constraint (user_id, pillar_name) is sufficient