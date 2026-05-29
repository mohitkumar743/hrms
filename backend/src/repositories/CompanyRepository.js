import { BaseDbRepository } from './BaseDbRepository.js';

export class CompanyRepository extends BaseDbRepository {
  constructor() {
    super('companies.json', 'cmp');
  }
}
