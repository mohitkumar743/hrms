import { BaseDbRepository } from './BaseDbRepository.js';

export class CompanyPagePermissionRepository extends BaseDbRepository {
  constructor() {
    super('companyPagePermissions.json', 'perm');
  }
}
