export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  const normalizedDigits = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
  
  if (normalizedDigits.length === 0) return '';
  if (normalizedDigits.length <= 1) return `+${normalizedDigits}`;
  if (normalizedDigits.length <= 4) return `+${normalizedDigits[0]} (${normalizedDigits.slice(1)}`;
  if (normalizedDigits.length <= 7) return `+${normalizedDigits[0]} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4)}`;
  if (normalizedDigits.length <= 9) return `+${normalizedDigits[0]} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7)}`;
  return `+${normalizedDigits[0]} (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
};

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
};

export const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return '+' + (digits.startsWith('8') ? '7' + digits.slice(1) : digits);
};