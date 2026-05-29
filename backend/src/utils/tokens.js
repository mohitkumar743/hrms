import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, companyId: user.companyId, employeeId: user.employeeId, role: user.role },
    env.accessSecret,
    { expiresIn: env.accessTtl }
  );
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.refreshSecret, { expiresIn: env.refreshTtl });
}

export const verifyAccessToken = (token) => jwt.verify(token, env.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret);
