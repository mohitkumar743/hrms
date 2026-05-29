import { BaseDbRepository } from './BaseDbRepository.js';

export class LeaveRepository extends BaseDbRepository {
  constructor() {
    super('leaves.json', 'lev');
  }
}
