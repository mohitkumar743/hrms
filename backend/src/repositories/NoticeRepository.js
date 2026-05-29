import { BaseDbRepository } from './BaseDbRepository.js';

export class NoticeRepository extends BaseDbRepository {
  constructor() {
    super('notices.json', 'ntc');
  }
}
