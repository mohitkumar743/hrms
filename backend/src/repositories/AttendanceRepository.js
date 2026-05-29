import { BaseDbRepository } from './BaseDbRepository.js';

export class AttendanceRepository extends BaseDbRepository {
  constructor() {
    super('attendance.json', 'att');
  }
}
