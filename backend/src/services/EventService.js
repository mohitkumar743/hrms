import { EventRepository } from '../repositories/EventRepository.js';
import { AppError } from '../utils/AppError.js';

function isVisible(record) {
  if (record.isActive === false) return false;
  if (!record.expiryDate) return true;
  const endOfDay = new Date(`${record.expiryDate}T23:59:59.999`);
  return endOfDay.getTime() >= Date.now();
}

export class EventService {
  constructor() {
    this.events = new EventRepository();
  }

  async list(companyId, includeExpired = false) {
    const rows = await this.events.findAll({ companyId });
    return rows
      .filter((row) => includeExpired || isVisible(row))
      .sort((a, b) => `${a.eventDate || ''} ${a.startTime || ''}`.localeCompare(`${b.eventDate || ''} ${b.startTime || ''}`));
  }

  async create(companyId, createdBy, payload) {
    return this.events.create({
      companyId,
      title: payload.title,
      eventDate: payload.eventDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      lead: payload.lead || '',
      expiryDate: payload.expiryDate || null,
      isActive: payload.isActive ?? true,
      createdBy
    });
  }

  async delete(companyId, id, deletedBy = null) {
    const event = await this.events.findById(id);
    if (!event || event.companyId !== companyId) throw new AppError('Event not found', 404);
    return this.events.delete(id, deletedBy);
  }
}
