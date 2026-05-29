import { BaseDbRepository } from './BaseDbRepository.js';

export class EventRepository extends BaseDbRepository {
  constructor() {
    super('events.json', 'evt');
  }
}
