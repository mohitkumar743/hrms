import { BaseDbRepository } from './BaseDbRepository.js';

export class PageRepository extends BaseDbRepository {
  constructor() {
    super('pages.json', 'page');
  }
}
