import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { generatePayroll, listPayroll, lockPayroll } from '../controllers/PayrollController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, payrollGenerateSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', listPayroll);
router.post('/generate', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(payrollGenerateSchema), generatePayroll);
router.patch('/:id/lock', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), lockPayroll);

export default router;
