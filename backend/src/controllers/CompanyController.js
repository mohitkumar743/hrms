import { CompanyService } from '../services/CompanyService.js';

const service = new CompanyService();

export const listCompanies = async (_req, res, next) => {
  try { res.json(await service.list()); } catch (error) { next(error); }
};

export const getMyCompany = async (req, res, next) => {
  try { res.json(await service.get(req.user.companyId)); } catch (error) { next(error); }
};

export const createCompany = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (error) { next(error); }
};

export const updateCompany = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (error) { next(error); }
};
