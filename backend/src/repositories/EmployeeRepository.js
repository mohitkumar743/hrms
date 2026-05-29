import { BaseDbRepository } from './BaseDbRepository.js';

export class EmployeeRepository extends BaseDbRepository {
  constructor() {
    super('employees.json', 'emp');
  }

  findByQrCode(qrCode) {
    return this.findOne({ qrCode });
  }
}
