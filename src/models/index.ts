export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  gender: 'male' | 'female' | 'other';
  interests: string[];
}

export type Profile = User; // For discovery

export interface Match {
  id: string;
  users: [string, string]; // IDs of matched users
  createdAt: Date;
  lastMessage?: Message;
  status: 'pending' | 'matched' | 'blocked';
  initiatorId: string;
  profileData?: Profile; // Populated by frontend for display
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}
