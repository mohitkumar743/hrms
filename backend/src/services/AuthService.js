import bcrypt from 'bcryptjs';
import { ROLES } from '../config/roles.js';
import { CompanyRepository } from '../repositories/CompanyRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

export class AuthService {
  constructor() {
    this.users = new UserRepository();
    this.companies = new CompanyRepository();
  }

  async ensureSeedAdmin() {
    const existingSuperAdmin = await this.users.findOne({ role: ROLES.SUPER_ADMIN });
    let hasSuperAdmin = Boolean(existingSuperAdmin);
    if (existingSuperAdmin && (existingSuperAdmin.name !== 'Attendo Super Admin' || existingSuperAdmin.email !== 'superadmin@attendo.in')) {
      await this.users.update(existingSuperAdmin.id, {
        name: 'Attendo Super Admin',
        email: 'superadmin@attendo.in'
      });
    }

    if (!hasSuperAdmin) {
      await this.users.create({
        companyId: null,
        name: 'Attendo Super Admin',
        email: 'superadmin@attendo.in',
        passwordHash: await bcrypt.hash('password123', 10),
        role: ROLES.SUPER_ADMIN,
        status: 'ACTIVE'
      });
    }

    const existingCompanyAdmin = await this.users.findByEmail('admin@acme.test');
    if (existingCompanyAdmin) return;
    const company = await this.companies.create({ name: 'Acme HR', status: 'ACTIVE' });
    await this.users.create({
      companyId: company.id,
      name: 'Acme Admin',
      email: 'admin@acme.test',
      passwordHash: await bcrypt.hash('password123', 10),
      role: ROLES.COMPANY_ADMIN,
      status: 'ACTIVE'
    });
  }

  async login(email, password) {
    await this.ensureSeedAdmin();
    const user = await this.users.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') throw new AppError('Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);
    return this.issueTokens(user);
  }

  async refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.users.findById(decoded.sub);
    if (!user) throw new AppError('Invalid refresh token', 401);
    return this.issueTokens(user);
  }

  issueTokens(user) {
    const safeUser = {
      id: user.id,
      companyId: user.companyId,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role
    };
    return {
      user: safeUser,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user)
    };
  }
}
