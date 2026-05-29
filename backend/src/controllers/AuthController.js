import { AuthService } from '../services/AuthService.js';

const service = new AuthService();

export const login = async (req, res, next) => {
  try {
    res.json(await service.login(req.body.email, req.body.password));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    res.json(await service.refresh(req.body.refreshToken));
  } catch (error) {
    next(error);
  }
};

export const logout = (_req, res) => res.json({ message: 'Logged out' });
