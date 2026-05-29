import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { createEvent, deleteEvent, listEvents } from '../controllers/EventController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { eventSchema, idParamSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE), listEvents);
router.post('/', authorize(ROLES.COMPANY_ADMIN), validate(eventSchema), createEvent);
router.delete('/:id', authorize(ROLES.COMPANY_ADMIN), validate(idParamSchema), deleteEvent);

export default router;
