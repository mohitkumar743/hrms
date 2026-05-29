import { AttendanceRepository } from '../repositories/AttendanceRepository.js';
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';
import { AppError } from '../utils/AppError.js';
import { todayIso, timeToMinutes } from '../utils/date.js';
import { SettingsService } from './SettingsService.js';

export class AttendanceService {
  constructor() {
    this.attendance = new AttendanceRepository();
    this.employees = new EmployeeRepository();
    this.settingsService = new SettingsService();
  }

  list(companyId, filters = {}) {
    return this.attendance.findAll({ companyId, ...filters });
  }

  async scan(companyId, qrCode, type) {
    const employee = await this.employees.findByQrCode(qrCode);
    if (!employee || employee.companyId !== companyId || employee.status !== 'ACTIVE') {
      throw new AppError('Invalid employee QR code', 404);
    }
    return this.punch(companyId, employee, type, 'QR');
  }

  async selfPunch(companyId, employeeId, type) {
    const employee = await this.employees.findById(employeeId);
    if (!employee || employee.companyId !== companyId || employee.status !== 'ACTIVE') {
      throw new AppError('Employee not found', 404);
    }
    return this.punch(companyId, employee, type, 'SELF');
  }

  async punch(companyId, employee, type, attendanceMethod) {
    const date = todayIso();
    const now = new Date();
    const existing = await this.attendance.findOne({ companyId, employeeId: employee.id, date });

    if (type === 'CHECK_IN') {
      if (existing?.checkInTime) throw new AppError('Employee already checked in today', 409);
      const settings = await this.settingsService.get(companyId);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lateBy = Math.max(0, currentMinutes - timeToMinutes(settings.officeStartTime) - settings.gracePeriodMinutes);
      if (existing) return this.attendance.update(existing.id, { checkInTime: now.toISOString(), status: lateBy ? 'LATE' : 'PRESENT', lateMinutes: lateBy });
      return this.attendance.create({
        companyId,
        employeeId: employee.id,
        date,
        checkInTime: now.toISOString(),
        checkOutTime: null,
        status: lateBy ? 'LATE' : 'PRESENT',
        lateMinutes: lateBy,
        overtimeMinutes: 0,
        attendanceMethod
      });
    }

    if (!existing?.checkInTime) throw new AppError('Check in is required before checkout', 409);
    if (existing.checkOutTime) throw new AppError('Employee already checked out today', 409);
    return this.attendance.update(existing.id, { checkOutTime: now.toISOString() });
  }

  async manualCheckout(companyId, id, checkOutTime) {
    const record = await this.attendance.findById(id);
    if (!record || record.companyId !== companyId) throw new AppError('Attendance record not found', 404);
    if (!record.checkInTime) throw new AppError('Punch in is required before punch out', 409);
    const checkout = new Date(`${record.date}T${checkOutTime}:00`);
    if (Number.isNaN(checkout.getTime())) throw new AppError('Invalid punch out time', 400);
    if (checkout.getTime() < new Date(record.checkInTime).getTime()) {
      throw new AppError('Punch out time must be after punch in time', 400);
    }
    return this.attendance.update(id, { checkOutTime: checkout.toISOString() });
  }

  async regularize(companyId, id, payload) {
    const record = await this.attendance.findById(id);
    if (!record || record.companyId !== companyId) throw new AppError('Attendance record not found', 404);
    const updates = {};

    if (payload.checkInTime) {
      const checkin = new Date(`${record.date}T${payload.checkInTime}:00`);
      if (Number.isNaN(checkin.getTime())) throw new AppError('Invalid punch in time', 400);
      updates.checkInTime = checkin.toISOString();
    }

    if (payload.checkOutTime) {
      const checkout = new Date(`${record.date}T${payload.checkOutTime}:00`);
      if (Number.isNaN(checkout.getTime())) throw new AppError('Invalid punch out time', 400);
      updates.checkOutTime = checkout.toISOString();
    }

    const nextCheckIn = updates.checkInTime || record.checkInTime;
    const nextCheckOut = updates.checkOutTime || record.checkOutTime;
    if (nextCheckIn && nextCheckOut && new Date(nextCheckOut).getTime() < new Date(nextCheckIn).getTime()) {
      throw new AppError('Punch out time must be after punch in time', 400);
    }

    return this.attendance.update(id, updates);
  }

  async delete(companyId, id, deletedBy = null) {
    const record = await this.attendance.findById(id);
    if (!record || record.companyId !== companyId) throw new AppError('Attendance record not found', 404);
    return this.attendance.delete(id, deletedBy);
  }
}
