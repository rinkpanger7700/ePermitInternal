UPDATE applications
SET current_stage = 'Under Review'
WHERE current_stage = 'Payment Verification';

UPDATE releasing
SET status = 'Under Review'
WHERE status = 'Payment Verification';

UPDATE reviews
SET status = 'Under Review'
WHERE status = 'Payment Verification';

UPDATE approvals
SET status = 'Under Review'
WHERE status = 'Payment Verification';

UPDATE inspections
SET status = 'Under Review'
WHERE status = 'Payment Verification';
