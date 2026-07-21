const COMMON_PASSWORDS = new Set([
  "123456",
  "123456789",
  "12345678",
  "12345",
  "1234567",
  "1234567890",
  "qwerty",
  "qwerty123",
  "password",
  "password1",
  "password123",
  "letmein",
  "welcome",
  "welcome1",
  "admin",
  "admin123",
  "abc123",
  "abcd1234",
  "iloveyou",
  "000000",
  "111111",
  "123123",
  "1q2w3e4r",
  "1qaz2wsx",
  "monkey",
  "dragon",
  "football",
  "sunshine",
  "master",
  "superman",
  "trustno1",
]);

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Validates password complexity per OWASP ASVS 2.1: minimum length + a mix
 * of character classes, rejected against a common-password blacklist.
 * Returns a Vietnamese user-facing error message, or null if valid.
 */
export function validatePasswordComplexity(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Mật khẩu không được vượt quá ${MAX_PASSWORD_LENGTH} ký tự.`;
  }
  if (!/[a-z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ thường.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ hoa.";
  }
  if (!/[0-9]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 chữ số.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*).";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Mật khẩu này quá phổ biến và không an toàn. Vui lòng chọn mật khẩu khác.";
  }
  return null;
}

/**
 * Validates the "confirm password" field against the primary password.
 * Checked only after the primary password itself passes
 * validatePasswordComplexity, so the two never produce conflicting errors
 * for the same submission.
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (confirmPassword.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu xác nhận phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
  }
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không trùng khớp.";
  }
  return null;
}
