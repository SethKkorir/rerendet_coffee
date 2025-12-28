// utils/cardValidation.js
/**
 * Card validation and formatting utilities
 */

/**
 * Format card number with spaces (XXXX XXXX XXXX XXXX)
 */
export const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
};

/**
 * Format expiry date (MM/YY)
 */
export const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
};

/**
 * Luhn algorithm for card number validation
 */
export const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (!/^\d{13,19}$/.test(cleaned)) {
        return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

/**
 * Validate expiry date (must be in future)
 */
export const validateExpiryDate = (expiryDate) => {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);

    if (!match) {
        return false;
    }

    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);

    if (month < 1 || month > 12) {
        return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
};

/**
 * Validate CVV (3 or 4 digits)
 */
export const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
};

/**
 * Detect card type from number
 */
export const getCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

    return 'Unknown';
};

export default {
    formatCardNumber,
    formatExpiryDate,
    validateCardNumber,
    validateExpiryDate,
    validateCVV,
    getCardType
};
