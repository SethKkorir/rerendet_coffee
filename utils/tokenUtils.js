import crypto from 'crypto';

export function generateRandomToken(len = 32) {
  return crypto.randomBytes(len).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}