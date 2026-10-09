import type { AgeRange } from '@/data/filter-options';
import type { Character, CharacterGender, CommunicationStyle, Ethnicity, GenderFilter, InterestCategory } from '@/models/types';

/** Повний ефективний набір фільтрів сітки Знайомств (S08/S09). */
export interface CharacterFilters {
  gender: GenderFilter;
  ageRanges: AgeRange[];
  ethnicities: Ethnicity[];
  interests: InterestCategory[];
  styles: CommunicationStyle[];
  /** Лише персонажі, з якими ще немає розмови. */
  onlyNew: boolean;
}

export const DEFAULT_FILTERS: CharacterFilters = {
  gender: 'everyone',
  ageRanges: [],
  ethnicities: [],
  interests: [],
  styles: [],
  onlyNew: false,
};

const GENDER_BY_FILTER: Record<Exclude<GenderFilter, 'everyone'>, CharacterGender> = {
  women: 'female',
  men: 'male',
  nonbinary: 'nonbinary',
};

export function getAgeRange(age: number): AgeRange {
  if (age < 25) return '18-24';
  if (age < 30) return '25-29';
  return '30+';
}

/**
 * Чиста функція фільтрації.
 * Семантика: усередині групи — АБО (будь-який з обраних), між групами — І.
 * Порожня група = обмеження немає.
 */
export function filterCharacters(
  characters: readonly Character[],
  filters: CharacterFilters,
  conversationIds: ReadonlySet<string>,
): Character[] {
  return characters.filter((character) => {
    if (filters.gender !== 'everyone' && character.gender !== GENDER_BY_FILTER[filters.gender]) return false;
    if (filters.ageRanges.length > 0 && !filters.ageRanges.includes(getAgeRange(character.age))) return false;
    if (filters.ethnicities.length > 0 && !filters.ethnicities.includes(character.ethnicity)) return false;
    if (filters.interests.length > 0 && !character.interestCategories.some((item) => filters.interests.includes(item))) {
      return false;
    }
    if (filters.styles.length > 0 && !filters.styles.includes(character.communicationStyle)) return false;
    if (filters.onlyNew && conversationIds.has(character.id)) return false;
    return true;
  });
}

/** Кількість активних фільтрів для бейджа іконки фільтрів. Інтереси видно чіпами на сторінці — не рахуємо. */
export function countAdvancedFilters(filters: CharacterFilters): number {
  return (
    (filters.gender !== 'everyone' ? 1 : 0) +
    filters.ageRanges.length +
    filters.ethnicities.length +
    filters.styles.length +
    (filters.onlyNew ? 1 : 0)
  );
}

/** Імутабельне перемикання значення в масиві мультивибору. */
export function toggleValue<TValue>(values: readonly TValue[], value: TValue): TValue[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

/** «1 персонаж», «3 персонажі», «5 персонажів». */
export function pluralizeCharacters(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} персонажів`;
  if (last === 1) return `${count} персонаж`;
  if (last >= 2 && last <= 4) return `${count} персонажі`;
  return `${count} персонажів`;
}
