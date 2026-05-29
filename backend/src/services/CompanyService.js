import bcrypt from 'bcryptjs';
import { ROLES } from '../config/roles.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';
import { CompanyPagePermissionRepository } from '../repositories/CompanyPagePermissionRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';

const defaultCompanyPageIds = ['page_company_info'];
const demoCompanyAdmin = {
  email: 'admin@acme.test',
  password: 'password123',
  name: 'Acme Admin'
};

export class CompanyService {
  constructor() {
    this.companies = new CompanyRepository();
    this.permissions = new CompanyPagePermissionRepository();
    this.users = new UserRepository();
  }

  async list() {
    const companies = await this.companies.findAll();
    return Promise.all(companies.map((company) => this.withAdminLogin(company)));
  }

  async get(id) {
    const company = await this.companies.findById(id);
    if (!company) throw new AppError('Company not found', 404);
    return this.withAdminLogin(company);
  }

  async create(payload) {
    const company = await this.companies.create({
      ...payload,
      adminName: payload.adminName || payload.contactPersonName || `${payload.name} Admin`,
      adminEmail: payload.adminEmail || payload.contactPersonEmail || payload.email || '',
      adminPassword: payload.adminPassword || '',
      status: payload.status || 'ACTIVE'
    });
    await this.permissions.create({ companyId: company.id, pageIds: defaultCompanyPageIds });
    await this.upsertCompanyAdmin(company);
    return company;
  }

  async update(id, payload) {
    const existing = await this.get(id);
    const company = await this.companies.update(id, {
      ...payload,
      adminName: payload.adminName ?? existing.adminName,
      adminEmail: payload.adminEmail ?? existing.adminEmail,
      adminPassword: payload.adminPassword || existing.adminPassword
    });
    if (!company) throw new AppError('Company not found', 404);
    await this.upsertCompanyAdmin(company, payload.adminPassword);
    return company;
  }

  async withAdminLogin(company) {
    const admin = await this.users.findOne({ companyId: company.id, role: ROLES.COMPANY_ADMIN });
    const needsDemoBackfill = admin?.email === demoCompanyAdmin.email && !company.adminPassword;
    if (needsDemoBackfill || (admin && (!company.adminEmail || !company.adminName))) {
      const updated = await this.companies.update(company.id, {
        adminName: company.adminName || admin.name || demoCompanyAdmin.name,
        adminEmail: company.adminEmail || admin.email,
        adminPassword: needsDemoBackfill ? demoCompanyAdmin.password : company.adminPassword || ''
      });
      return updated || company;
    }

    return {
      ...company,
      adminName: company.adminName || admin?.name || '',
      adminEmail: company.adminEmail || admin?.email || ''
    };
  }

  async upsertCompanyAdmin(company, passwordOverride = null) {
    if (!company.adminEmail) return null;

    const existing = await this.users.findOne({ companyId: company.id, role: ROLES.COMPANY_ADMIN });
    const payload = {
      companyId: company.id,
      name: company.adminName || `${company.name} Admin`,
      email: company.adminEmail,
      role: ROLES.COMPANY_ADMIN,
      status: company.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'
    };

    const password = passwordOverride || company.adminPassword;
    if (password) payload.passwordHash = await bcrypt.hash(password, 10);

    if (existing) return this.users.update(existing.id, payload);
    if (!password) throw new AppError('Company admin password is required', 400);
    return this.users.create(payload);
  }
}
