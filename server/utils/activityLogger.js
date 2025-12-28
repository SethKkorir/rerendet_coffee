import ActivityLog from '../models/ActivityLog.js';

/**
 * Logs an administrative action to the database.
 * @param {Object} req - Express request object (to extract admin user and IP)
 * @param {String} action - The action type (e.g. 'DELETE_PRODUCT')
 * @param {String} entityName - Name of the entity (e.g. "Ethiopian Arabica")
 * @param {String} entityId - ID of the entity
 * @param {Object} details - Additional metadata or before/after state
 */
export const logActivity = async (req, action, entityName, entityId = null, details = {}) => {
    try {
        // Safety check: ensure user exists
        if (!req.user || !req.user._id) {
            console.warn('⚠️ [ActivityLog] Attempted to log action without authenticated user');
            return;
        }

        const log = new ActivityLog({
            admin: req.user._id,
            action,
            entityName,
            entityId: entityId ? entityId.toString() : null,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        await log.save();
        console.log(`📝 [ActivityLog] Logged: ${action} by ${req.user.firstName}`);

    } catch (error) {
        // We don't want logging failures to crash the main request
        console.error('❌ [ActivityLog] Failed to save log:', error.message);
    }
};
