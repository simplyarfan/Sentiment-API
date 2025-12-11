export const MIN_TEXT_LENGTH = 1;
export const MAX_TEXT_LENGTH = 512;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateText = (text: string): ValidationResult => {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return {
      isValid: false,
      error: 'Please enter some text to analyze',
    };
  }

  if (trimmedText.length < MIN_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Text must be at least ${MIN_TEXT_LENGTH} character`,
    };
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Text must be ${MAX_TEXT_LENGTH} characters or less`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
