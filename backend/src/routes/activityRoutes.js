import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { listActivities, logPageView } from '../controllers/ActivityController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { activityPageViewSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.post('/page-view', validate(activityPageViewSchema), logPageView);
router.get('/', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), listActivities);

export default router;
