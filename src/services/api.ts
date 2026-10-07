import { Post, User, ChatMessage, NotificationItem, DailyHabitItem } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('rt_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('rt_token', token);
      } else {
        localStorage.removeItem('rt_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('rt_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
          // Token expired or invalid
          this.setToken(null);
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error) {
      console.warn(`[API] Error on ${endpoint}:`, (error as Error).message);
      throw error;
    }
  }

  // Auth Endpoints
  async register(name: string, email: string, password: string, sobrietyDate?: string) {
    const data = await this.request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, sobrietyDate }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me', {
      method: 'GET',
    });
  }

  async logout() {
    try {
      await this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Posts Endpoints
  async getPosts(params?: { filter?: string; category?: string; search?: string; authorId?: string; page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.set('filter', params.filter);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.authorId) searchParams.set('authorId', params.authorId);
    if (params?.page) searchParams.set('page', String(params.page));

    const qs = searchParams.toString();
    return this.request<{ success: boolean; total: number; posts: any[] }>(`/posts${qs ? `?${qs}` : ''}`);
  }

  async createPost(postData: {
    text: string;
    images?: string[];
    category?: string;
    milestoneDay?: number;
    isAnonymous?: boolean;
    challengePost?: boolean;
  }) {
    return this.request<{ success: boolean; post: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: any) {
    return this.request<{ success: boolean; post: any }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string) {
    return this.request<{ success: boolean; message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string) {
    return this.request<{ success: boolean; liked: boolean; likesCount: number }>(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async savePost(id: string) {
    return this.request<{ success: boolean; saved: boolean; savedCount: number }>(`/posts/${id}/save`, {
      method: 'POST',
    });
  }

  async sharePost(id: string) {
    return this.request<{ success: boolean; shareCount: number }>(`/posts/${id}/share`, {
      method: 'POST',
    });
  }

  // Comments Endpoints
  async getComments(postId: string) {
    return this.request<{ success: boolean; count: number; comments: any[] }>(`/posts/${postId}/comments`);
  }

  async addComment(postId: string, text: string) {
    return this.request<{ success: boolean; comment: any }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async deleteComment(commentId: string) {
    return this.request<{ success: boolean; message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Users Endpoints
  async getUserProfile(idOrEmail: string) {
    return this.request<{ success: boolean; user: any }>(`/users/${encodeURIComponent(idOrEmail)}`);
  }

  async updateProfile(profileData: {
    name?: string;
    bio?: string;
    avatar?: string;
    sobrietyDate?: string;
    pledgedToday?: string;
  }) {
    return this.request<{ success: boolean; user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async followUser(userId: string) {
    return this.request<{ success: boolean; message: string; followingCount: number; targetFollowersCount: number }>(
      `/users/${userId}/follow`,
      { method: 'POST' }
    );
  }

  async unfollowUser(userId: string) {
    return this.request<{ success: boolean; message: string; followingCount: number; targetFollowersCount: number }>(
      `/users/${userId}/follow`,
      { method: 'DELETE' }
    );
  }

  async blockUser(userId: string) {
    return this.request<{ success: boolean; message: string; blocked: string[] }>(`/users/${userId}/block`, {
      method: 'POST',
    });
  }

  async unblockUser(userId: string) {
    return this.request<{ success: boolean; message: string; blocked: string[] }>(`/users/${userId}/block`, {
      method: 'DELETE',
    });
  }

  async getBlockedUsers() {
    return this.request<{ success: boolean; blocked: any[] }>('/users/blocked');
  }

  async searchUsers(query: string) {
    return this.request<{ success: boolean; users: any[] }>(`/users/search?q=${encodeURIComponent(query)}`);
  }

  // Messages Endpoints
  async getConversations() {
    return this.request<{ success: boolean; conversations: any[] }>('/messages');
  }

  async getMessages(userId: string) {
    return this.request<{ success: boolean; count: number; messages: any[] }>(`/messages/${encodeURIComponent(userId)}`);
  }

  async sendMessage(userId: string, text: string) {
    return this.request<{ success: boolean; message: any }>(`/messages/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Notifications Endpoints
  async getNotifications() {
    return this.request<{ success: boolean; unreadCount: number; notifications: any[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; notification: any }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // 100-Day Challenge Endpoints
  async getChallenge() {
    return this.request<{ success: boolean; challenge: any }>('/challenge');
  }

  async startChallenge(startDate?: string) {
    return this.request<{ success: boolean; message: string; challenge: any }>('/challenge/start', {
      method: 'POST',
      body: JSON.stringify({ startDate }),
    });
  }

  async recordChallengeProgress(data: {
    day?: number;
    reflection?: string;
    urgeLevel?: number;
    mood?: string;
    shareToFeed?: boolean;
  }) {
    return this.request<{ success: boolean; message: string; challenge: any }>('/challenge/progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports Endpoints
  async createReport(targetType: 'post' | 'user' | 'comment', targetId: string, reason: string, details?: string) {
    return this.request<{ success: boolean; message: string; reportId: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, reason, details }),
    });
  }

  // Admin Endpoints
  async getAdminStats() {
    return this.request<{ success: boolean; stats: any }>('/admin/stats');
  }

  async getAdminUsers(page: number = 1) {
    return this.request<{ success: boolean; total: number; users: any[] }>(`/admin/users?page=${page}`);
  }

  async getAdminReports(status?: string) {
    return this.request<{ success: boolean; count: number; reports: any[] }>(
      `/admin/reports${status ? `?status=${status}` : ''}`
    );
  }

  async updateReportStatus(id: string, status: string) {
    return this.request<{ success: boolean; report: any }>(`/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deletePostByAdmin(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleSuspendUser(id: string) {
    return this.request<{ success: boolean; message: string; isSuspended: boolean }>(`/admin/users/${id}/suspend`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient();
