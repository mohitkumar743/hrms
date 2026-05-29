import { ROLES } from '../config/roles.js';
import { CompanyPagePermissionRepository } from '../repositories/CompanyPagePermissionRepository.js';
import { PageRepository } from '../repositories/PageRepository.js';
import { AppError } from '../utils/AppError.js';

const superAdminPageIds = ['page_super_admin_dashboard', 'page_companies', 'page_company_onboard', 'page_company_view', 'page_page_master', 'page_permission_master'];

function sortPages(pages) {
  return [...pages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.label.localeCompare(b.label));
}

function buildTree(pages) {
  const pageMap = new Map(sortPages(pages).map((page) => [page.id, { ...page, children: [] }]));
  const roots = [];

  pageMap.forEach((page) => {
    if (page.parentId && pageMap.has(page.parentId)) {
      pageMap.get(page.parentId).children.push(page);
    } else {
      roots.push(page);
    }
  });

  return roots;
}

export class PageService {
  constructor() {
    this.pages = new PageRepository();
    this.permissions = new CompanyPagePermissionRepository();
  }

  async list() {
    return sortPages(await this.pages.findAll());
  }

  async tree() {
    return buildTree(await this.list());
  }

  create(payload) {
    return this.pages.create({
      ...payload,
      parentId: payload.parentId || null,
      sortOrder: Number(payload.sortOrder || 0),
      isActive: payload.isActive ?? true
    });
  }

  async update(id, payload) {
    const updates = { ...payload };
    if (Object.prototype.hasOwnProperty.call(payload, 'parentId')) updates.parentId = payload.parentId || null;
    if (Object.prototype.hasOwnProperty.call(payload, 'sortOrder')) updates.sortOrder = Number(payload.sortOrder || 0);
    const page = await this.pages.update(id, updates);
    if (!page) throw new AppError('Page not found', 404);
    return page;
  }

  async navigation(user) {
    const allPages = (await this.list()).filter((page) => page.isActive && page.roles?.includes(user.role));

    if (user.role === ROLES.SUPER_ADMIN) {
      return buildTree(allPages.filter((page) => superAdminPageIds.includes(page.id)));
    }

    const permission = await this.permissions.findOne({ companyId: user.companyId });
    const assignedIds = new Set(permission?.pageIds || []);
    const visibleIds = new Set(assignedIds);
    allPages.forEach((page) => {
      if (assignedIds.has(page.id) && page.parentId) visibleIds.add(page.parentId);
    });
    const visible = allPages.filter((page) => visibleIds.has(page.id) || visibleIds.has(page.parentId));
    return buildTree(visible);
  }

  listPermissions() {
    return this.permissions.findAll();
  }

  async getCompanyPermission(companyId) {
    return (await this.permissions.findOne({ companyId })) || { companyId, pageIds: [] };
  }

  async setCompanyPermission(companyId, pageIds) {
    const activePages = await this.pages.findAll({ isActive: true });
    const pageMap = new Map(activePages.map((page) => [page.id, page]));
    const validIds = new Set(pageMap.keys());
    const cleanedSet = new Set([...new Set(pageIds)].filter((pageId) => validIds.has(pageId)));

    activePages.forEach((page) => {
      if (!page.parentId) {
        const children = activePages.filter((child) => child.parentId === page.id);
        if (!children.length) return;

        const hasSelectedChild = children.some((child) => cleanedSet.has(child.id));
        if (hasSelectedChild) cleanedSet.add(page.id);
        else cleanedSet.delete(page.id);
      }
    });

    cleanedSet.forEach((pageId) => {
      const page = pageMap.get(pageId);
      if (page?.parentId) cleanedSet.add(page.parentId);
    });

    const cleanedPageIds = [...cleanedSet];
    const existing = await this.permissions.findOne({ companyId });
    if (existing) return this.permissions.update(existing.id, { companyId, pageIds: cleanedPageIds });
    return this.permissions.create({ companyId, pageIds: cleanedPageIds });
  }
}
