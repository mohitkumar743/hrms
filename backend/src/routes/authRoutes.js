import { Router } from 'express';
import { login, logout, refresh } from '../controllers/AuthController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema } from '../validations/schemas.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);

export default router;
