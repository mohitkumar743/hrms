import { ActivityService } from '../services/ActivityService.js';

const service = new ActivityService();
const trackedMethods = new Set(['DELETE']);
const ignoredPaths = [/^\/api\/auth/, /^\/api\/activity/];

export function activityLogger(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.locals.responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const path = req.originalUrl.split('?')[0];
    if (!req.user || !trackedMethods.has(req.method) || ignoredPaths.some((pattern) => pattern.test(path)) || res.statusCode >= 400) return;
    service.logRequest(req).catch(() => {});
  });
  next();
}
