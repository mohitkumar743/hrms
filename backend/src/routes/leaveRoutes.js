import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { applyLeave, decideLeave, listLeaves } from '../controllers/LeaveController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { leaveDecisionSchema, leaveSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', listLeaves);
router.post('/', validate(leaveSchema), applyLeave);
router.patch('/:id/decision', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(leaveDecisionSchema), decideLeave);

export default router;
