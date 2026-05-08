-- The current database has a very restrictive check constraint on 'current_stage'
-- that prevents us from moving to 'Inspection', 'For Approval', etc.
-- This script drops that restriction so the workflow can proceed.

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_current_stage_check;
