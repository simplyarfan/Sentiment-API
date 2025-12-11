import axios, { type AxiosError } from 'axios';
import type { SentimentResult, HistoryResponse, CacheStats, ApiError } from '../types';

// API base URL - configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleApiError = (error: AxiosError<ApiError>): never => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.detail || 'An error occurred';
    throw new Error(message);
  } else if (error.request) {
    // Request made but no response
    throw new Error('Unable to reach the server. Please check if the API is running.');
  } else {
    // Request setup error
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// API functions
export const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
  try {
    const response = await api.post<SentimentResult>('/analyze', { text });
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
};

export const getHistory = async (limit: number = 10): Promise<HistoryResponse> => {
  try {
    const response = await api.get<HistoryResponse>(`/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
};

export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    const response = await api.get<CacheStats>('/cache/stats');
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await api.delete('/cache/clear');
  } catch (error) {
    return handleApiError(error as AxiosError<ApiError>);
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};

export default api;
