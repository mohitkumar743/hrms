import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { deleteAttendance, listAttendance, manualCheckout, regularizeAttendance, scanAttendance, selfPunchAttendance } from '../controllers/AttendanceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { attendanceManualCheckoutSchema, attendanceRegularizeSchema, attendanceScanSchema, attendanceSelfPunchSchema, idParamSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', listAttendance);
router.post('/scan', validate(attendanceScanSchema), scanAttendance);
router.post('/self-punch', authorize(ROLES.EMPLOYEE), validate(attendanceSelfPunchSchema), selfPunchAttendance);
router.patch('/:id/manual-checkout', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(attendanceManualCheckoutSchema), manualCheckout);
router.patch('/:id/regularize', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(attendanceRegularizeSchema), regularizeAttendance);
router.delete('/:id', authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), validate(idParamSchema), deleteAttendance);

export default router;
