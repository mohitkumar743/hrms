import { AttendanceRepository } from '../repositories/AttendanceRepository.js';
import { LeaveRepository } from '../repositories/LeaveRepository.js';
import { PayrollRepository } from '../repositories/PayrollRepository.js';

export class ReportService {
  constructor() {
    this.attendance = new AttendanceRepository();
    this.leaves = new LeaveRepository();
    this.payrolls = new PayrollRepository();
  }

  async summary(companyId) {
    const [attendance, leaves, payrolls] = await Promise.all([
      this.attendance.findAll({ companyId }),
      this.leaves.findAll({ companyId }),
      this.payrolls.findAll({ companyId })
    ]);
    return {
      attendance,
      leaves,
      payrolls,
      totals: {
        present: attendance.filter((row) => row.status === 'PRESENT').length,
        late: attendance.filter((row) => row.status === 'LATE').length,
        pendingLeaves: leaves.filter((row) => row.status === 'PENDING').length,
        payrollCost: payrolls.reduce((sum, row) => sum + Number(row.finalSalary || 0), 0)
      }
    };
  }
}
