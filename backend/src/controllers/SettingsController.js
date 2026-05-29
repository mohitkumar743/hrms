import { SettingsService } from '../services/SettingsService.js';

const service = new SettingsService();

export const getSettings = async (req, res, next) => {
  try { res.json(await service.get(req.user.companyId)); } catch (error) { next(error); }
};

export const updateSettings = async (req, res, next) => {
  try { res.json(await service.upsert(req.user.companyId, req.body)); } catch (error) { next(error); }
};
