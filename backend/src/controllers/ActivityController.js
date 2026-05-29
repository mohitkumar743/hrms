import { ActivityService } from '../services/ActivityService.js';

const service = new ActivityService();

export const listActivities = async (req, res, next) => {
  try { res.json(await service.list(req.user, req.query)); } catch (error) { next(error); }
};

export const logPageView = async (req, res, next) => {
  try {
    res.status(204).send();
  } catch (error) { next(error); }
};
