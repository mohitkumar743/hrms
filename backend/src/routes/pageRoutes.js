import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import { createPage, getCompanyPermission, getNavigation, listPages, listPermissions, setCompanyPermission, updatePage } from '../controllers/PageController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { pagePermissionSchema, pageSchema, pageUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/navigation', getNavigation);

router.use(authorize(ROLES.SUPER_ADMIN));
router.get('/', listPages);
router.post('/', validate(pageSchema), createPage);
router.put('/:id', validate(pageUpdateSchema), updatePage);
router.get('/permissions', listPermissions);
router.get('/permissions/:companyId', getCompanyPermission);
router.put('/permissions/:companyId', validate(pagePermissionSchema), setCompanyPermission);

export default router;
