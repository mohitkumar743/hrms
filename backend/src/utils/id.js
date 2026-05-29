import crypto from 'node:crypto';

export const createId = (prefix) => `${prefix}_${crypto.randomUUID()}`;
