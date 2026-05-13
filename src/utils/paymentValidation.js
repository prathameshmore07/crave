// Payment Validation Utilities
// Used for both membership and food order payments

export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!cleaned) return { valid: false, error: 'Card number is required' };
  if (!/^\d{16}$/.test(cleaned)) {
    return { valid: false, error: 'Card number must be 16 digits' };
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid card number' };
  }
  
  return { valid: true };
};

export const validateCardExpiry = (expiry) => {
  if (!expiry) return { valid: false, error: 'Expiry date is required' };
  
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { valid: false, error: 'Format: MM/YY' };
  }
  
  const [month, year] = expiry.split('/').map(x => parseInt(x, 10));
  
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month' };
  }
  
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired' };
  }
  
  return { valid: true };
};

export const validateCardCVV = (cvv) => {
  if (!cvv) return { valid: false, error: 'CVV is required' };
  if (!/^\d{3}$/.test(cvv)) {
    return { valid: false, error: 'CVV must be 3 digits' };
  }
  return { valid: true };
};

export const validateCardHolder = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Cardholder name is required' };
  }
  if (name.trim().length < 3) {
    return { valid: false, error: 'Cardholder name must be at least 3 characters' };
  }
  if (!/^[a-zA-Z\s]*$/.test(name)) {
    return { valid: false, error: 'Cardholder name can only contain letters' };
  }
  return { valid: true };
};

export const validateUPIId = (upiId) => {
  if (!upiId) return { valid: false, error: 'UPI ID is required' };
  
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
  
  if (!upiRegex.test(upiId)) {
    return {
      valid: false,
      error: 'Invalid UPI ID format (e.g., user@bank)',
    };
  }
  
  return { valid: true };
};

export const validateAllCardFields = (cardData) => {
  const errors = {};
  
  const numberValidation = validateCardNumber(cardData.number);
  if (!numberValidation.valid) errors.number = numberValidation.error;
  
  const expiryValidation = validateCardExpiry(cardData.expiry);
  if (!expiryValidation.valid) errors.expiry = expiryValidation.error;
  
  const cvvValidation = validateCardCVV(cardData.cvv);
  if (!cvvValidation.valid) errors.cvv = cvvValidation.error;
  
  const holderValidation = validateCardHolder(cardData.holder);
  if (!holderValidation.valid) errors.holder = holderValidation.error;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Format helpers
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ').slice(0, 19);
};

export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

export const formatCVV = (value) => {
  return value.replace(/\D/g, '').slice(0, 3);
};

export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  return `****${cleaned.slice(-4)}`;
};

export default {
  validateCardNumber,
  validateCardExpiry,
  validateCardCVV,
  validateCardHolder,
  validateUPIId,
  validateAllCardFields,
  formatCardNumber,
  formatExpiry,
  formatCVV,
  maskCardNumber,
};
