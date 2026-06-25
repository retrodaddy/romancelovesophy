// Strong-password policy: 8+ chars, with a letter, a number and a special char.
export function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw)) return "Include at least one letter.";
  if (!/[0-9]/.test(pw)) return "Include at least one number.";
  if (!/[^a-zA-Z0-9]/.test(pw)) return "Include at least one special character (e.g. ! ? @ #).";
  return null;
}

export const PASSWORD_RULE = "At least 8 characters, with a letter, a number and a special character.";
