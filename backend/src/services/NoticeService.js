import { NoticeRepository } from '../repositories/NoticeRepository.js';
import { AppError } from '../utils/AppError.js';

function isVisible(record) {
  if (record.isActive === false) return false;
  if (!record.expiryDate) return true;
  const endOfDay = new Date(`${record.expiryDate}T23:59:59.999`);
  return endOfDay.getTime() >= Date.now();
}

export class NoticeService {
  constructor() {
    this.notices = new NoticeRepository();
  }

  async list(companyId, includeExpired = false) {
    const rows = await this.notices.findAll({ companyId });
    return rows
      .filter((row) => includeExpired || isVisible(row))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async create(companyId, createdBy, payload) {
    return this.notices.create({
      companyId,
      title: payload.title,
      message: payload.message,
      expiryDate: payload.expiryDate || null,
      isActive: payload.isActive ?? true,
      createdBy
    });
  }

  async delete(companyId, id, deletedBy = null) {
    const notice = await this.notices.findById(id);
    if (!notice || notice.companyId !== companyId) throw new AppError('Notice not found', 404);
    return this.notices.delete(id, deletedBy);
  }
}
