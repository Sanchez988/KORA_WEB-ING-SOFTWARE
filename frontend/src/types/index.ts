export interface User {
  id: string;
  email: string;
  dateOfBirth: string;
  verified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum RelationshipGoal {
  FRIENDSHIP = 'FRIENDSHIP',
  DATING = 'DATING',
  SERIOUS_RELATIONSHIP = 'SERIOUS_RELATIONSHIP',
  JUST_MEETING_PEOPLE = 'JUST_MEETING_PEOPLE',
  STUDY_GROUPS = 'STUDY_GROUPS',
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age?: number;
  bio: string;
  gender: Gender;
  program: string;
  semester?: number;
  photos: string[];
  interests: string[];
  hobbies: string[];
  relationshipGoal: RelationshipGoal;
  minAge: number;
  maxAge: number;
  maxDistance?: number;
  showMeTo: string;
  showLastSeen: boolean;
  showDistance: boolean;
  incognitoMode: boolean;
  completeness: number;
  distance?: number;
  lastSeen?: string;
}

export interface Match {
  matchId: string;
  matchedAt: string;
  user: {
    id: string;
    name: string;
    photos: string[];
    bio: string;
  };
  lastMessage?: {
    content: string;
    sentAt: string;
    senderId: string;
    isRead: boolean;
  };
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  images: string[];
  attachmentNames?: string[];
  attachmentTypes?: string[];
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  sender?: {
    name: string;
    photo: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  dateOfBirth: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    hasProfile: boolean;
    lastLogin?: string;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}
