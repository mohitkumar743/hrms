import { BaseDbRepository } from './BaseDbRepository.js';

export class SettingsRepository extends BaseDbRepository {
  constructor() {
    super('settings.json', 'set');
  }
}
