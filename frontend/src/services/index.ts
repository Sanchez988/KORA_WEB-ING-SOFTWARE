import { api } from './api';
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types';

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

export const profileService = {
  createProfile: async (data: any) => {
    const response = await api.post('/profiles', data);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/profiles/me', data);
    return response.data;
  },

  getUserProfile: async (userId: string) => {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  },

  getDiscoveryProfiles: async (limit = 20, offset = 0) => {
    const response = await api.get(`/profiles/discovery?limit=${limit}&offset=${offset}`);
    return response.data;
  },
};

export const matchService = {
  likeProfile: async (targetUserId: string, isSuperLike = false) => {
    const response = await api.post('/matches/like', { targetUserId, isSuperLike });
    return response.data;
  },

  dislikeProfile: async (targetUserId: string) => {
    const response = await api.post('/matches/dislike', { targetUserId });
    return response.data;
  },

  getMyMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },

  unmatch: async (matchId: string) => {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  },
};

export const messageService = {
  sendMessage: async (
    matchId: string,
    content: string,
    images: string[] = [],
    attachmentNames: string[] = [],
    attachmentTypes: string[] = []
  ) => {
    const response = await api.post('/messages', {
      matchId,
      content,
      images,
      attachmentNames,
      attachmentTypes,
    });
    return response.data;
  },

  getMessages: async (matchId: string, limit = 100, offset = 0) => {
    const response = await api.get(`/messages/${matchId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  markAsRead: async (matchId: string) => {
    const response = await api.post('/messages/mark-read', { matchId });
    return response.data;
  },
};

export { uploadService } from './upload.service';
export { locationService } from './location.service';
