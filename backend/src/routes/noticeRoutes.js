import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { createNotice, deleteNotice, listNotices } from '../controllers/NoticeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema, noticeSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE), listNotices);
router.post('/', authorize(ROLES.COMPANY_ADMIN), validate(noticeSchema), createNotice);
router.delete('/:id', authorize(ROLES.COMPANY_ADMIN), validate(idParamSchema), deleteNotice);

export default router;
