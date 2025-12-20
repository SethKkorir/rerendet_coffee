// utils/inputSanitizer.js
/**
 * Sanitize user input to prevent XSS and injection attacks
 */

/**
 * Remove HTML tags and sanitize string input
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
};

/**
 * Sanitize an entire object recursively
 */
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'string') {
                sanitized[key] = sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
    }

    return sanitized;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return '';

    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Validate and sanitize phone number (Kenyan format)
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return '';

    // Remove all non-digit characters
    let sanitized = phone.replace(/\D/g, '');

    // Ensure it starts with 254 (Kenya country code)
    if (sanitized.startsWith('0')) {
        sanitized = '254' + sanitized.substring(1);
    } else if (sanitized.startsWith('7') || sanitized.startsWith('1')) {
        sanitized = '254' + sanitized;
    } else if (!sanitized.startsWith('254')) {
        return '';
    }

    // Validate length (should be 12 digits for Kenya: 254 + 9 digits)
    return sanitized.length === 12 ? sanitized : '';
};

/**
 * Sanitize monetary amount
 */
export const sanitizeAmount = (amount) => {
    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed < 0) {
        return 0;
    }

    // Round to 2 decimal places
    return Math.round(parsed * 100) / 100;
};

export default {
    sanitizeString,
    sanitizeObject,
    sanitizeEmail,
    sanitizePhone,
    sanitizeAmount
};
