import User from '../models/User.js';

export async function addAuditEntry(userId, { action, actorId = null, oldValue = null, newValue = null, reason = '', ip = '', ua = '' }) {
  try {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          auditLogs: {
            action,
            actor: actorId,
            oldValue,
            newValue,
            reason,
            ip,
            ua,
            createdAt: new Date()
          }
        }
      }
    );
  } catch (err) {
    console.warn('Failed to write audit entry', err);
  }
}