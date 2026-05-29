import { PayrollService } from '../services/PayrollService.js';
import { AppError } from '../utils/AppError.js';

const service = new PayrollService();

export const listPayroll = async (req, res, next) => {
  try {
    const filters = req.user.role === 'EMPLOYEE' ? { employeeId: req.user.employeeId } : {};
    res.json(await service.list(req.user.companyId, filters));
  } catch (error) { next(error); }
};

export const generatePayroll = async (req, res, next) => {
  try { res.status(201).json(await service.generate(req.user.companyId, req.body.month)); } catch (error) { next(error); }
};

export const lockPayroll = async (req, res, next) => {
  try {
    const payroll = await service.lock(req.user.companyId, req.params.id);
    if (!payroll) throw new AppError('Payroll not found', 404);
    res.json(payroll);
  } catch (error) { next(error); }
};
