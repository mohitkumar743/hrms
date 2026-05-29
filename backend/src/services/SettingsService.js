import { SettingsRepository } from '../repositories/SettingsRepository.js';

const defaults = {
  officeStartTime: '09:30',
  officeEndTime: '18:30',
  gracePeriodMinutes: 10,
  lateFineEnabled: true,
  lateFineAmount: 100,
  lateCountThreshold: 3,
  companyProfile: { name: 'Acme HR', timezone: 'Asia/Kolkata' }
};

export class SettingsService {
  constructor() {
    this.settings = new SettingsRepository();
  }

  async get(companyId) {
    return (await this.settings.findOne({ companyId })) || { companyId, ...defaults };
  }

  async upsert(companyId, payload) {
    const existing = await this.settings.findOne({ companyId });
    if (existing) return this.settings.update(existing.id, { ...payload, companyId });
    return this.settings.create({ companyId, ...defaults, ...payload });
  }
}
