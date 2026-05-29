import bcrypt from 'bcryptjs';
import { ROLES } from '../config/roles.js';
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { SettingsService } from './SettingsService.js';
import { AppError } from '../utils/AppError.js';

export class EmployeeService {
  constructor() {
    this.employees = new EmployeeRepository();
    this.users = new UserRepository();
    this.settings = new SettingsService();
  }

  list(companyId) {
    return this.employees.findAll({ companyId });
  }

  async get(companyId, id) {
    const employee = await this.employees.findById(id);
    if (!employee || employee.companyId !== companyId) throw new AppError('Employee not found', 404);
    return employee;
  }

  async create(companyId, payload) {
    const settings = await this.settings.get(companyId);
    const employee = await this.employees.create({
      companyId,
      ...payload,
      shiftStart: payload.shiftStart || settings.officeStartTime,
      shiftEnd: payload.shiftEnd || settings.officeEndTime,
      customShiftEnabled: Boolean(payload.shiftStart || payload.shiftEnd),
      status: payload.status || 'ACTIVE',
      qrCode: payload.qrCode || `${companyId}:${payload.employeeCode}`
    });
    await this.users.create({
      companyId,
      employeeId: employee.id,
      name: payload.fullName,
      email: payload.email,
      passwordHash: await bcrypt.hash(payload.password, 10),
      role: ROLES.EMPLOYEE,
      status: 'ACTIVE'
    });
    return employee;
  }

  async update(companyId, id, payload) {
    await this.get(companyId, id);
    const updated = await this.employees.update(id, payload);
    if (payload.email || payload.fullName) {
      const user = await this.users.findOne({ employeeId: id });
      if (user) await this.users.update(user.id, { email: payload.email || user.email, name: payload.fullName || user.name });
    }
    return updated;
  }

  async deactivate(companyId, id) {
    await this.get(companyId, id);
    const employee = await this.employees.update(id, { status: 'INACTIVE' });
    const user = await this.users.findOne({ employeeId: id });
    if (user) await this.users.update(user.id, { status: 'INACTIVE' });
    return employee;
  }

  async activate(companyId, id) {
    await this.get(companyId, id);
    const employee = await this.employees.update(id, { status: 'ACTIVE' });
    const user = await this.users.findOne({ employeeId: id });
    if (user) await this.users.update(user.id, { status: 'ACTIVE' });
    return employee;
  }

  async delete(companyId, id, deletedBy = null) {
    await this.get(companyId, id);
    const employee = await this.employees.delete(id, deletedBy);
    const user = await this.users.findOne({ employeeId: id });
    if (user) await this.users.delete(user.id, deletedBy);
    return employee;
  }
}
