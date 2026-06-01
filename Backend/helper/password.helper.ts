import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

/**
 * Rule: ≥ 8 ký tự và có ít nhất 1 chữ số.
 * Trả về null nếu OK, string lỗi nếu vi phạm.
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  if (!/\d/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ số";
  }
  return null;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
export const isValidEmail = (email: string): boolean =>
  typeof email === "string" && EMAIL_REGEX.test(email.trim());
