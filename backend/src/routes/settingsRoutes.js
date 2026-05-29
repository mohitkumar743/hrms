import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { getSettings, updateSettings } from '../controllers/SettingsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { settingsSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', getSettings);
router.put('/', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(settingsSchema), updateSettings);

export default router;
