import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, loginWithGoogle as loginWithGoogleApi } from '../services/authService';
import { User, LoginRequest } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<User>; // Sửa lại kiểu trả về
  loginWithGoogle: (token: string) => Promise<User>;    // Thêm hàm mới
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    const response = await loginApi(credentials);
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user; // Trả về user
    }
    throw new Error("Login failed"); // Ném lỗi nếu response không hợp lệ
  };

  // Thêm hàm mới cho Google Login
  const loginWithGoogle = async (idToken: string): Promise<User> => {
    const response = await loginWithGoogleApi(idToken);
    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    }
    throw new Error("Google Login failed");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};