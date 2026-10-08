import { apiClient } from './client';
import { RouteAnalysisResult, HistoryItem, AppSettings } from '../types';

export const routeApi = {
  analyzeRoute: (payload: {
    origin: { address: string; lat: number; lng: number };
    destination: { address: string; lat: number; lng: number };
    vehicleType: string;
    emergencyPriority: string;
    incidentType?: string;
    notes?: string;
  }) => {
    return apiClient<RouteAnalysisResult>('/routes/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refreshRoute: (requestId: string, payload?: any) => {
    return apiClient<RouteAnalysisResult>(`/routes/${requestId}/refresh`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  getRouteDetails: (requestId: string) => {
    return apiClient<RouteAnalysisResult>(`/routes/${requestId}`);
  },

  deleteRoute: (requestId: string) => {
    return apiClient<{ success: boolean; message: string }>(`/routes/${requestId}`, {
      method: 'DELETE',
    });
  },
};

export const historyApi = {
  getHistory: (params?: {
    page?: number;
    limit?: number;
    vehicleType?: string;
    emergencyPriority?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.vehicleType) query.append('vehicleType', params.vehicleType);
    if (params?.emergencyPriority) query.append('emergencyPriority', params.emergencyPriority);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    return apiClient<{
      success: boolean;
      data: HistoryItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/routes/history${queryString ? `?${queryString}` : ''}`);
  },
};

export const settingsApi = {
  getSettings: () => {
    return apiClient<{ success: boolean; data: AppSettings }>('/settings');
  },
  updateSettings: (settings: Partial<AppSettings>) => {
    return apiClient<{ success: boolean; data: AppSettings }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },
};

export const authApi = {
  syncUser: (userData: any) => {
    return apiClient<{ success: boolean; user: any; message: string }>('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  getProfile: (email?: string, firebaseUid?: string) => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (firebaseUid) params.append('firebaseUid', firebaseUid);
    return apiClient<{ success: boolean; user: any }>(`/auth/profile?${params.toString()}`);
  },
  updateProfile: (updates: any) => {
    return apiClient<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

export const healthApi = {
  checkHealth: () => {
    return apiClient<{
      success: boolean;
      status: string;
      services: { database: string; geminiAI: string; routingEngine?: string; mapTiles?: string };
      uptimeSeconds: number;
    }>('/health');
  },
};
