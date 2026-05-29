import { EventService } from '../services/EventService.js';
import { ROLES } from '../config/roles.js';

const service = new EventService();

export const listEvents = async (req, res, next) => {
  try {
    const includeExpired = req.user.role === ROLES.COMPANY_ADMIN && req.query.all === 'true';
    res.json(await service.list(req.user.companyId, includeExpired));
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    res.status(201).json(await service.create(req.user.companyId, req.user.sub, req.body));
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    res.json(await service.delete(req.user.companyId, req.params.id, req.user.sub));
  } catch (error) {
    next(error);
  }
};
