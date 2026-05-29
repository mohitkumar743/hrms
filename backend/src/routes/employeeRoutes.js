import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { activateEmployee, createEmployee, deactivateEmployee, deleteEmployee, getEmployee, listEmployees, updateEmployee } from '../controllers/EmployeeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { employeeSchema, employeeUpdateSchema, idParamSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), listEmployees);
router.get('/:id', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), getEmployee);
router.post('/', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(employeeSchema), createEmployee);
router.put('/:id', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(employeeUpdateSchema), updateEmployee);
router.patch('/:id/activate', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), activateEmployee);
router.patch('/:id/deactivate', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), deactivateEmployee);
router.delete('/:id', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), deleteEmployee);

export default router;
