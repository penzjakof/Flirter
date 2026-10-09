/** Мінімальний вік доступу до сервісу. */
export const MINIMUM_AGE = 18;
/** Розумна верхня межа, щоб відсікти неможливі дати. */
const MAXIMUM_AGE = 120;

export type BirthDateValidation =
  | { ok: true; isoDate: string; age: number }
  | { ok: false; reason: 'incomplete' | 'invalid' | 'future' | 'unrealistic' | 'underage' };

export function calculateAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Клієнтська перевірка дати народження.
 * Остаточна перевірка — на сервері (S02); тут лише швидкий фідбек.
 */
export function validateBirthDate(day: string, month: string, year: string, now: Date = new Date()): BirthDateValidation {
  if (day.length === 0 || month.length === 0 || year.length !== 4) {
    return { ok: false, reason: 'incomplete' };
  }

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (![dayNumber, monthNumber, yearNumber].every(Number.isInteger)) {
    return { ok: false, reason: 'invalid' };
  }

  const date = new Date(yearNumber, monthNumber - 1, dayNumber);
  const isRealCalendarDate =
    date.getFullYear() === yearNumber && date.getMonth() === monthNumber - 1 && date.getDate() === dayNumber;

  if (!isRealCalendarDate) return { ok: false, reason: 'invalid' };
  if (date.getTime() > now.getTime()) return { ok: false, reason: 'future' };

  const age = calculateAge(date, now);
  if (age > MAXIMUM_AGE) return { ok: false, reason: 'unrealistic' };
  if (age < MINIMUM_AGE) return { ok: false, reason: 'underage' };

  const isoDate = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
  return { ok: true, isoDate, age };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(rawEmail: string): string {
  return rawEmail.trim().toLowerCase();
}

export function isValidEmail(rawEmail: string): boolean {
  const email = normalizeEmail(rawEmail);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 24;

/** Прибирає керівні символи й зайві пробіли з nickname. */
export function sanitizeNickname(rawNickname: string): string {
  return rawNickname.replace(/[\u0000-\u001F\u007F<>]/g, '').replace(/\s+/g, ' ').trim();
}

export function isValidNickname(rawNickname: string): boolean {
  const nickname = sanitizeNickname(rawNickname);
  return nickname.length >= NICKNAME_MIN_LENGTH && nickname.length <= NICKNAME_MAX_LENGTH;
}

const NICKNAME_ADJECTIVES = ['Сміливий', 'Тихий', 'Нічний', 'Сонячний', 'Веселий', 'Загадковий'];
const NICKNAME_NOUNS = ['Мандрівник', 'Романтик', 'Мрійник', 'Котик', 'Капітан', 'Поет'];

export function suggestNickname(): string {
  const adjective = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  return `${adjective}${noun}`;
}

export const OTP_LENGTH = 6;

export function sanitizeDigits(rawValue: string, maxLength: number): string {
  return rawValue.replace(/\D/g, '').slice(0, maxLength);
}

/** Маскує email для приватного відображення: iv***@gmail.com */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  const visible = localPart.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(1, localPart.length - 2))}@${domain}`;
}
