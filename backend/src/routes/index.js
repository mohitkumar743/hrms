import { Router } from 'express';
import attendanceRoutes from './attendanceRoutes.js';
import activityRoutes from './activityRoutes.js';
import authRoutes from './authRoutes.js';
import companyRoutes from './companyRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import eventRoutes from './eventRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import noticeRoutes from './noticeRoutes.js';
import payrollRoutes from './payrollRoutes.js';
import pageRoutes from './pageRoutes.js';
import reportRoutes from './reportRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import { activityLogger } from '../middleware/activityMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(activityLogger);
router.use('/companies', companyRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/activity', activityRoutes);
router.use('/notices', noticeRoutes);
router.use('/events', eventRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportRoutes);

export default router;
