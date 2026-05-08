-- Update triggers to fire on INSERT as well as UPDATE

DROP TRIGGER IF EXISTS trg_update_stage_review ON reviews;
CREATE TRIGGER trg_update_stage_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_review();

DROP TRIGGER IF EXISTS trg_update_stage_inspection ON inspections;
CREATE TRIGGER trg_update_stage_inspection
AFTER INSERT OR UPDATE ON inspections
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_inspection();

DROP TRIGGER IF EXISTS trg_update_stage_approval ON approvals;
CREATE TRIGGER trg_update_stage_approval
AFTER INSERT OR UPDATE ON approvals
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_approval();

DROP TRIGGER IF EXISTS trg_update_stage_releasing ON releasing;
CREATE TRIGGER trg_update_stage_releasing
AFTER INSERT OR UPDATE ON releasing
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_releasing();
