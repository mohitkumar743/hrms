import { ReportService } from '../services/ReportService.js';

const service = new ReportService();

export const getReports = async (req, res, next) => {
  try { res.json(await service.summary(req.user.companyId)); } catch (error) { next(error); }
};
