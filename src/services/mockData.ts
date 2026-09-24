import { Profile } from '../models';

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'p1',
    name: 'Anna',
    age: 24,
    bio: 'Love hiking and coffee ☕️',
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80'],
    gender: 'female',
    interests: ['Hiking', 'Coffee', 'Travel'],
  },
  {
    id: 'p2',
    name: 'Sophie',
    age: 26,
    bio: 'Art gallery enthusiast and dog mom.',
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80'],
    gender: 'female',
    interests: ['Art', 'Dogs', 'Wine'],
  },
  {
    id: 'p3',
    name: 'Emma',
    age: 22,
    bio: 'Musician looking for a muse.',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'],
    gender: 'female',
    interests: ['Music', 'Guitar', 'Festivals'],
  },
];
