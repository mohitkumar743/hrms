import { BaseDbRepository } from './BaseDbRepository.js';

export class UserRepository extends BaseDbRepository {
  constructor() {
    super('users.json', 'usr');
  }

  findByEmail(email) {
    return this.findOne({ email });
  }
}
