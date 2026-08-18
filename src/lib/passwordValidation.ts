/**
 * Enterprise Password Validation & Security Rules
 * Enforces strong password criteria:
 * - Minimum 8 characters
 * - Uppercase letters (Caps Lock)
 * - Lowercase letters
 * - Numbers (0-9)
 * - Symbols / Special Characters (!@#$%^&*...)
 * - Explicit security advice: Avoid birthdays, personal/family names, phone numbers
 */

export interface PasswordStrengthResult {
  score: number; // 0 (weak) to 4 (strong)
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  hasCommonWeakPatterns: boolean;
  issues: string[];
  feedback: string[];
}

export function validatePasswordStrength(
  password: string,
  userContext?: { name?: string; email?: string } | string
): PasswordStrengthResult {
  const issues: string[] = [];

  const contextObj = typeof userContext === 'string' 
    ? { email: userContext, name: undefined }
    : userContext;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(password);

  if (!hasMinLength) {
    issues.push('Must be at least 8 characters long');
  }
  if (!hasUppercase) {
    issues.push('Must include at least one uppercase letter (A-Z)');
  }
  if (!hasLowercase) {
    issues.push('Must include at least one lowercase letter (a-z)');
  }
  if (!hasNumber) {
    issues.push('Must include at least one digit (0-9)');
  }
  if (!hasSpecialChar) {
    issues.push('Must include at least one special symbol (!@#$%^&*...)');
  }

  // Check weak patterns (birth years, phone numbers, names, email fragments)
  let hasCommonWeakPatterns = false;
  
  // 4-digit birth year check (1940-2035)
  if (/(19[4-9]\d|20[0-3]\d)/.test(password)) {
    issues.push('Avoid using birth years or calendar years (e.g. 1998, 2024)');
    hasCommonWeakPatterns = true;
  }

  // Phone number or 7+ consecutive digits
  if (/\d{7,}/.test(password)) {
    issues.push('Avoid using phone numbers or long numeric sequences');
    hasCommonWeakPatterns = true;
  }

  // Personal context checks
  if (contextObj?.email) {
    const emailUser = contextObj.email.split('@')[0].toLowerCase();
    if (emailUser.length >= 3 && password.toLowerCase().includes(emailUser)) {
      issues.push('Avoid using parts of your email address in the password');
      hasCommonWeakPatterns = true;
    }
  }

  if (contextObj?.name) {
    const nameWords = contextObj.name.toLowerCase().split(/[\s._-]+/);
    for (const word of nameWords) {
      if (word.length >= 3 && password.toLowerCase().includes(word)) {
        issues.push('Avoid using personal or family names in the password');
        hasCommonWeakPatterns = true;
        break;
      }
    }
  }

  // Calculate score (0 to 4)
  let passedCount = 0;
  if (hasMinLength) passedCount++;
  if (hasUppercase && hasLowercase) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecialChar) passedCount++;
  if (password.length >= 12) passedCount++;

  let score = Math.min(4, passedCount);
  if (hasCommonWeakPatterns && score > 1) {
    score = Math.max(1, score - 1);
  }

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    score,
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    hasCommonWeakPatterns,
    issues,
    feedback: issues
  };
}
