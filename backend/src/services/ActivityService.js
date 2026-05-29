import { ActivityRepository } from '../repositories/ActivityRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

const actionLabels = {
  POST: 'Created',
  PUT: 'Updated',
  PATCH: 'Updated',
  DELETE: 'Deleted'
};

const resourceLabels = [
  { pattern: /^\/api\/employees/, label: 'employee' },
  { pattern: /^\/api\/attendance\/self-punch/, label: 'own attendance' },
  { pattern: /^\/api\/attendance/, label: 'attendance record' },
  { pattern: /^\/api\/leave/, label: 'leave request' },
  { pattern: /^\/api\/notices/, label: 'notice' },
  { pattern: /^\/api\/events/, label: 'event' },
  { pattern: /^\/api\/payroll/, label: 'payroll' },
  { pattern: /^\/api\/settings/, label: 'settings' },
  { pattern: /^\/api\/pages\/permissions/, label: 'page permission' },
  { pattern: /^\/api\/pages/, label: 'page' },
  { pattern: /^\/api\/companies/, label: 'company' }
];

function activityMessage(method, path) {
  const resource = resourceLabels.find((item) => item.pattern.test(path))?.label || 'record';
  return `${actionLabels[method] || 'Performed action on'} ${resource}`;
}

function sanitizeBody(body = {}) {
  const blocked = new Set(['password', 'passwordHash', 'refreshToken', 'accessToken']);
  return Object.fromEntries(Object.entries(body).filter(([key]) => !blocked.has(key)));
}

export class ActivityService {
  constructor() {
    this.activities = new ActivityRepository();
    this.users = new UserRepository();
  }

  async list(user, filters = {}) {
    const scopedFilters = user.role === 'SUPER_ADMIN' ? {} : { companyId: user.companyId };
    const rows = await this.activities.findAll(scopedFilters);
    return rows
      .filter((row) => row.action === 'DELETE')
      .filter((row) => !filters.userId || row.userId === filters.userId)
      .filter((row) => !filters.action || row.action === filters.action)
      .filter((row) => !filters.date || row.date === filters.date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async log({ user, action, description, resource, resourceId, metadata }) {
    const userId = user?.sub || user?.id;
    if (!userId) return null;
    const fullUser = await this.users.findById(userId);
    const now = new Date();
    return this.activities.create({
      companyId: user.companyId || fullUser?.companyId || null,
      userId,
      employeeId: user.employeeId || fullUser?.employeeId || null,
      userName: fullUser?.name || 'Unknown user',
      userEmail: fullUser?.email || null,
      role: user.role || fullUser?.role || null,
      action,
      resource,
      resourceId: resourceId || null,
      description,
      metadata: metadata || null,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      createdAt: now.toISOString()
    });
  }

  async logRequest(req) {
    const path = req.originalUrl.split('?')[0];
    const resource = resourceLabels.find((item) => item.pattern.test(path))?.label || 'record';
    return this.log({
      user: req.user,
      action: req.method,
      resource,
      resourceId: req.params?.id || null,
      description: activityMessage(req.method, path),
      metadata: {
        path,
        body: sanitizeBody(req.body),
        deletedRecord: sanitizeBody(req.res?.locals?.responseBody || {})
      }
    });
  }

  logPageView(user, path, title) {
    return this.log({
      user,
      action: 'PAGE_VIEW',
      resource: 'page',
      description: `Viewed ${title || path}`,
      metadata: { path, title }
    });
  }
}
