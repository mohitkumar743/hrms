import { Router } from 'express';
import { getReports } from '../controllers/ReportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', getReports);

export default router;
