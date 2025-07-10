import axios from 'axios';
import { Question } from '../types/question.types';

const API_URL = 'https://localhost:2004/api'; // Thay bằng URL thực tế

// Giả sử bạn có một instance của axios đã được cấu hình với token
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const getQuestions = async (): Promise<Question[]> => {
  try {
    const response = await apiClient.get<Question[]>('/questions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    // Xử lý lỗi một cách hợp lý, có thể throw để component bắt
    throw error;
  }
};