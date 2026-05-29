import { LeaveService } from '../services/LeaveService.js';

const service = new LeaveService();

export const listLeaves = async (req, res, next) => {
  try { res.json(await service.list(req.user)); } catch (error) { next(error); }
};

export const applyLeave = async (req, res, next) => {
  try { res.status(201).json(await service.apply(req.user, req.body)); } catch (error) { next(error); }
};

export const decideLeave = async (req, res, next) => {
  try { res.json(await service.decide(req.user.companyId, req.params.id, req.body.status, req.body.remark, req.user.sub)); } catch (error) { next(error); }
};
