import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';

export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next(new AppError('Authentication required', 401));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) return next(new AppError('Forbidden', 403));
  next();
};
