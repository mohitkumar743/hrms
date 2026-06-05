import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { createCompany, getMyCompany, listCompanies, updateCompany } from '../controllers/CompanyController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { companySchema, companyUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/me', authorize(ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE), getMyCompany);
router.get('/', authorize(ROLES.SUPER_ADMIN), listCompanies);
router.post('/', authorize(ROLES.SUPER_ADMIN), validate(companySchema), createCompany);
router.put('/:id', authorize(ROLES.SUPER_ADMIN), validate(companyUpdateSchema), updateCompany);

export default router;
