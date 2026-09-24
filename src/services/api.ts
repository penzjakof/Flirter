import { User, Profile, Match, Message } from '../models';
import { MOCK_PROFILES } from './mockData';

export class MockApiService {
  async login(phone: string): Promise<User> {
    await new Promise((res) => setTimeout(res, 800)); // Network delay
    return {
      id: 'u1',
      name: 'Ivan',
      age: 25,
      bio: 'Ready for an adventure.',
      photos: [],
      gender: 'male',
      interests: ['Coding', 'Sports'],
    };
  }

  async getDiscoveryProfiles(): Promise<Profile[]> {
    await new Promise((res) => setTimeout(res, 500));
    return [...MOCK_PROFILES];
  }

  async getMatches(): Promise<Match[]> {
    await new Promise((res) => setTimeout(res, 400));
    return [
      {
        id: 'm1',
        users: ['u1', 'p1'],
        createdAt: new Date(),
        status: 'matched',
        initiatorId: 'u1',
        profileData: MOCK_PROFILES[0],
        lastMessage: {
          id: 'msg1',
          matchId: 'm1',
          senderId: 'p1',
          text: 'Hey! Nice to meet you.',
          createdAt: new Date(),
        },
      }
    ];
  }
}

export const api = new MockApiService();
