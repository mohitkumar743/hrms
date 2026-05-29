import { BaseDbRepository } from './BaseDbRepository.js';

export class PayrollRepository extends BaseDbRepository {
  constructor() {
    super('payrolls.json', 'pay');
  }
}
