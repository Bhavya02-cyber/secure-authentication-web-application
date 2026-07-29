export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== "string") return "Email is required";
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 255) return "Email must be under 255 characters";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Invalid email format";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || typeof password !== "string") return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be under 128 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "Password must contain at least one special character";
  return null;
}

export function validateName(name: string): string | null {
  if (!name || typeof name !== "string") return "Name is required";
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 100) return "Name must be under 100 characters";
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed))
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return null;
}

export function validateRegistration(data: {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(data.password);
  if (passwordErr) errors.password = passwordErr;

  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  if (!data.password || typeof data.password !== "string") {
    errors.password = "Password is required";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
