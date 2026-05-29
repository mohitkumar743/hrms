import { AttendanceRepository } from '../repositories/AttendanceRepository.js';
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';
import { PayrollRepository } from '../repositories/PayrollRepository.js';
import { SettingsService } from './SettingsService.js';

export class PayrollService {
  constructor() {
    this.payrolls = new PayrollRepository();
    this.employees = new EmployeeRepository();
    this.attendance = new AttendanceRepository();
    this.settings = new SettingsService();
  }

  list(companyId, filters = {}) {
    return this.payrolls.findAll({ companyId, ...filters });
  }

  async generate(companyId, month) {
    const employees = await this.employees.findAll({ companyId });
    const settings = await this.settings.get(companyId);
    const records = await this.attendance.findAll({ companyId });
    const monthRecords = records.filter((record) => record.date.startsWith(month));

    const payrolls = [];
    for (const employee of employees) {
      const rows = monthRecords.filter((record) => record.employeeId === employee.id);
      const presentDays = rows.filter((row) => ['PRESENT', 'LATE'].includes(row.status)).length;
      const lateCount = rows.filter((row) => row.status === 'LATE').length;
      const absentDays = Math.max(0, 26 - presentDays);
      const dailyRate = Number(employee.monthlySalary || 0) / 26;
      const absentDeductions = Math.round(absentDays * dailyRate);
      const lateFine = settings.lateFineEnabled && lateCount >= settings.lateCountThreshold ? lateCount * settings.lateFineAmount : 0;
      const deductions = absentDeductions + lateFine;
      const finalSalary = Math.max(0, Number(employee.monthlySalary || 0) - deductions);
      payrolls.push(await this.payrolls.create({
        companyId,
        employeeId: employee.id,
        month,
        presentDays,
        absentDays,
        lateCount,
        deductions,
        overtimeAmount: 0,
        finalSalary,
        locked: false
      }));
    }
    return payrolls;
  }

  async lock(companyId, id) {
    const payroll = await this.payrolls.findById(id);
    if (!payroll || payroll.companyId !== companyId) return null;
    return this.payrolls.update(id, { locked: true });
  }
}
