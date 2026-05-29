import { EmployeeService } from '../services/EmployeeService.js';

const service = new EmployeeService();

export const listEmployees = async (req, res, next) => {
  try { res.json(await service.list(req.user.companyId)); } catch (error) { next(error); }
};

export const getEmployee = async (req, res, next) => {
  try { res.json(await service.get(req.user.companyId, req.params.id)); } catch (error) { next(error); }
};

export const createEmployee = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.user.companyId, req.body)); } catch (error) { next(error); }
};

export const updateEmployee = async (req, res, next) => {
  try { res.json(await service.update(req.user.companyId, req.params.id, req.body)); } catch (error) { next(error); }
};

export const deactivateEmployee = async (req, res, next) => {
  try { res.json(await service.deactivate(req.user.companyId, req.params.id)); } catch (error) { next(error); }
};

export const activateEmployee = async (req, res, next) => {
  try { res.json(await service.activate(req.user.companyId, req.params.id)); } catch (error) { next(error); }
};

export const deleteEmployee = async (req, res, next) => {
  try { res.json(await service.delete(req.user.companyId, req.params.id, req.user.sub)); } catch (error) { next(error); }
};
