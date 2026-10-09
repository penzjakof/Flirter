import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import type { CommunicationStyle, Ethnicity, GenderFilter, InterestCategory } from '@/models/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type AgeRange = '18-24' | '25-29' | '30+';

export interface FilterOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: IconName;
}

/** Опції фільтра «Кого показувати» (іконковий селектор у S09). */
export const GENDER_OPTIONS: readonly FilterOption<GenderFilter>[] = [
  { value: 'everyone', label: 'Усі', icon: 'people-outline' },
  { value: 'women', label: 'Жінки', icon: 'female-outline' },
  { value: 'men', label: 'Чоловіки', icon: 'male-outline' },
  { value: 'nonbinary', label: 'Небінарні', icon: 'transgender-outline' },
];

export const AGE_RANGE_OPTIONS: readonly FilterOption<AgeRange>[] = [
  { value: '18-24', label: '18–24' },
  { value: '25-29', label: '25–29' },
  { value: '30+', label: '30+' },
];

export const INTEREST_OPTIONS: readonly FilterOption<InterestCategory>[] = [
  { value: 'active', label: 'Спорт', icon: 'barbell-outline' },
  { value: 'travel', label: 'Подорожі', icon: 'airplane-outline' },
  { value: 'music', label: 'Музика', icon: 'musical-notes-outline' },
  { value: 'art', label: 'Мистецтво', icon: 'color-palette-outline' },
  { value: 'food', label: 'Їжа й кава', icon: 'cafe-outline' },
  { value: 'books', label: 'Книжки й кіно', icon: 'book-outline' },
  { value: 'nature', label: 'Природа', icon: 'leaf-outline' },
];

export const COMMUNICATION_STYLE_OPTIONS: readonly FilterOption<CommunicationStyle>[] = [
  { value: 'romantic', label: 'Романтичний' },
  { value: 'playful', label: 'Грайливий' },
  { value: 'intellectual', label: 'Інтелектуальний' },
  { value: 'caring', label: 'Турботливий' },
];

/** Етнічний тип зовнішності вигаданого персонажа. */
export const ETHNICITY_OPTIONS: readonly FilterOption<Ethnicity>[] = [
  { value: 'european', label: 'Європейська' },
  { value: 'asian', label: 'Азійська' },
  { value: 'african', label: 'Африканська' },
  { value: 'latin', label: 'Латиноамериканська' },
  { value: 'middle-eastern', label: 'Близькосхідна' },
  { value: 'mixed', label: 'Змішана' },
];
