import { findRecordById, findRecords, upsertRecord } from '../database/postgresDb.js';
import { createId } from '../utils/id.js';

export class BaseDbRepository {
  constructor(fileName, idPrefix) {
    this.collection = fileName;
    this.idPrefix = idPrefix;
  }

  async findAll(filters = {}) {
    const records = await findRecords(this.collection);
    return records.filter((record) =>
      !record.isDeleted && Object.entries(filters).every(([key, value]) => value === undefined || record[key] === value)
    );
  }

  async findById(id) {
    const record = await findRecordById(this.collection, id);
    return record && !record.isDeleted ? record : null;
  }

  async findOne(filters) {
    const records = await this.findAll(filters);
    return records[0] || null;
  }

  async create(payload) {
    const record = {
      id: createId(this.idPrefix),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return upsertRecord(this.collection, record);
  }

  async update(id, payload) {
    const record = await findRecordById(this.collection, id);
    if (!record) return null;
    const updated = { ...record, ...payload, updatedAt: new Date().toISOString() };
    return upsertRecord(this.collection, updated);
  }

  async delete(id, deletedBy = null) {
    const record = await findRecordById(this.collection, id);
    if (!record || record.isDeleted) return null;
    const deletedAt = new Date().toISOString();
    const deleted = { ...record, isDeleted: true, deletedAt, deletedBy, updatedAt: deletedAt };
    return upsertRecord(this.collection, deleted);
  }
}
