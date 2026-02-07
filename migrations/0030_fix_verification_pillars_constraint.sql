-- UP
ALTER TABLE verification_pillars
DROP INDEX IF EXISTS `user_id`;

-- DOWN
-- Intentionally left empty. Do NOT recreate the incorrect
-- unique index on `user_id` during rollback; the
-- (user_id, pillar_name) constraint is sufficient.
-- Note: Don't recreate the wrong constraint on rollback
-- The unique_user_pillar constraint (user_id, pillar_name) is sufficient