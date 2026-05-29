import { AttendanceService } from '../services/AttendanceService.js';

const service = new AttendanceService();

export const listAttendance = async (req, res, next) => {
  try {
    const filters = req.user.role === 'EMPLOYEE'
      ? { ...req.query, employeeId: req.user.employeeId }
      : req.query;
    res.json(await service.list(req.user.companyId, filters));
  } catch (error) { next(error); }
};

export const scanAttendance = async (req, res, next) => {
  try { res.status(201).json(await service.scan(req.user.companyId, req.body.qrCode, req.body.type)); } catch (error) { next(error); }
};

export const selfPunchAttendance = async (req, res, next) => {
  try { res.status(201).json(await service.selfPunch(req.user.companyId, req.user.employeeId, req.body.type)); } catch (error) { next(error); }
};

export const manualCheckout = async (req, res, next) => {
  try { res.json(await service.manualCheckout(req.user.companyId, req.params.id, req.body.checkOutTime)); } catch (error) { next(error); }
};

export const regularizeAttendance = async (req, res, next) => {
  try { res.json(await service.regularize(req.user.companyId, req.params.id, req.body)); } catch (error) { next(error); }
};

export const deleteAttendance = async (req, res, next) => {
  try { res.json(await service.delete(req.user.companyId, req.params.id, req.user.sub)); } catch (error) { next(error); }
};
