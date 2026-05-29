import { LeaveRepository } from '../repositories/LeaveRepository.js';
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../utils/AppError.js';

export class LeaveService {
  constructor() {
    this.leaves = new LeaveRepository();
    this.employees = new EmployeeRepository();
  }

  async list(user) {
    const filters = { companyId: user.companyId };
    if (user.role === ROLES.EMPLOYEE) {
      if (!user.employeeId) throw new AppError('Employee profile not linked', 403);
      filters.employeeId = user.employeeId;
    }

    const [leaves, employees] = await Promise.all([
      this.leaves.findAll(filters),
      this.employees.findAll({ companyId: user.companyId })
    ]);
    const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));
    return leaves.map((leave) => {
      const employee = employeeMap.get(leave.employeeId);
      return {
        ...leave,
        employeeName: employee?.fullName || leave.employeeName || leave.employeeId,
        employeeCode: employee?.employeeCode || ''
      };
    });
  }

  async apply(user, payload) {
    const employeeId = user.role === ROLES.EMPLOYEE ? user.employeeId : payload.employeeId;
    if (!employeeId) throw new AppError('Employee is required', 400);

    const employee = await this.employees.findById(employeeId);
    if (!employee || employee.companyId !== user.companyId) throw new AppError('Employee not found', 404);

    return this.leaves.create({
      companyId: user.companyId,
      employeeId,
      employeeName: employee.fullName,
      employeeCode: employee.employeeCode,
      leaveType: payload.leaveType,
      dayType: payload.dayType,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
      status: 'PENDING'
    });
  }

  async decide(companyId, id, status, remark, decidedBy) {
    const leave = await this.leaves.findById(id);
    if (!leave || leave.companyId !== companyId) throw new AppError('Leave request not found', 404);
    return this.leaves.update(id, { status, remark: remark || '', decidedBy, decidedAt: new Date().toISOString() });
  }
}
