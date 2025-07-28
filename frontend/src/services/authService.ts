import apiClient from './apiClient';
import { User, LoginRequest, LoginResponse } from '../types/auth.types';

/**
 * Gọi API để đăng nhập
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/user/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
export const loginWithGoogle = async (token: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/google', { idToken: token });
  return response.data;
};