import axios from 'axios';
import { PaginatedResult, Question } from '../types/question.types';

const API_URL = 'https://localhost:2004/api'; 

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


export interface GetQuestionsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  difficultyLevel?: string;
}

// Hàm gọi API được nâng cấp
export const getQuestions = async (params: GetQuestionsParams): Promise<PaginatedResult<Question>> => {
  try {
    // Xây dựng query string một cách linh hoạt
    const queryParams = new URLSearchParams();
    
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params.difficultyLevel) queryParams.append('difficultyLevel', params.difficultyLevel); // Sửa ở đây

    const response = await apiClient.get<PaginatedResult<Question>>(`/questions?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
};