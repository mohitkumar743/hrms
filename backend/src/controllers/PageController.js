import { PageService } from '../services/PageService.js';

const service = new PageService();

export const listPages = async (_req, res, next) => {
  try { res.json(await service.list()); } catch (error) { next(error); }
};

export const createPage = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (error) { next(error); }
};

export const updatePage = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (error) { next(error); }
};

export const getNavigation = async (req, res, next) => {
  try { res.json(await service.navigation(req.user)); } catch (error) { next(error); }
};

export const listPermissions = async (_req, res, next) => {
  try { res.json(await service.listPermissions()); } catch (error) { next(error); }
};

export const getCompanyPermission = async (req, res, next) => {
  try { res.json(await service.getCompanyPermission(req.params.companyId)); } catch (error) { next(error); }
};

export const setCompanyPermission = async (req, res, next) => {
  try { res.json(await service.setCompanyPermission(req.params.companyId, req.body.pageIds)); } catch (error) { next(error); }
};
