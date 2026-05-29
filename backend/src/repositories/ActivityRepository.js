import { BaseDbRepository } from './BaseDbRepository.js';

export class ActivityRepository extends BaseDbRepository {
  constructor() {
    super('activityLogs.json', 'act');
  }
}
