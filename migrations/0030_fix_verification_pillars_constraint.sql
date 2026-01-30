-- Fix verification_pillars table to allow multiple pillars per user
-- Remove the incorrect UNIQUE constraint on user_id
-- The correct constraint (user_id, pillar_name) already exists
-- UP
ALTER TABLE verification_pillars
DROP INDEX user_id;

-- DOWN
-- Note: Don't recreate the wrong constraint on rollback
-- The unique_user_pillar constraint (user_id, pillar_name) is sufficient