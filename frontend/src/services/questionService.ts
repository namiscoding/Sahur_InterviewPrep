import apiClient from './apiClient'; // Import the shared apiClient
import { PaginatedResult, Question } from '../types/question.types'; // Assuming PaginatedResult is still defined externally

export interface QuestionForStaff {
  id: number;
  content: string;
  sampleAnswer?: string;
  difficultyLevel: number;
  isActive: boolean;
  usageCount: number;
  categories?: CategoryForQuestion[];
  tags?: TagForQuestion[];
}

// GetQuestionsParams from the conflicting branch (with difficultyLevel)
export interface GetQuestionsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  difficultyLevel?: string; // Kept this from the conflicting branch
}

export interface CategoryForQuestion {
  id: number;
  name: string;
}

export interface TagForQuestion {
  slug: string;
}

export interface CreateQuestionDTO {
  content: string;
  sampleAnswer?: string;
  difficultyLevel: number;
  isActive?: boolean;
  categoryIds?: number[];
  tagNames?: string[];
}

export interface UpdateQuestionInfoDTO {
  content: string;
  sampleAnswer?: string;
  difficultyLevel: number;
  categoryIds?: number[];
  tagNames?: string[];
}

export interface UpdateQuestionStatusDTO {
  isActive: boolean;
}

export interface CategoryUsageTrend {
  categoryId: number;
  categoryName: string;
  period: string;
  totalUsageCount: number;
  numberOfQuestions: number;
}

// --- Utility functions ---
export const getDifficultyLevelText = (level: number): string => {
  switch (level) {
    case 0: return 'Easy';
    case 1: return 'Medium';
    case 2: return 'Hard';
    default: return 'Unknown';
  }
};

export const getDifficultyLevelColor = (level: number): string => {
  switch (level) {
    case 0: return 'bg-green-100 text-green-800';
    case 1: return 'bg-yellow-100 text-yellow-800';
    case 2: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// --- API Calls ---

// Hàm gọi API được nâng cấp (từ file cũ)
export const getQuestions = async (params: GetQuestionsParams): Promise<PaginatedResult<Question>> => {
  try {
    // Xây dựng query string một cách linh hoạt
    const queryParams = new URLSearchParams();

    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params.difficultyLevel) queryParams.append('difficultyLevel', params.difficultyLevel);

    const response = await apiClient.get<PaginatedResult<Question>>(`customer/questions?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
};

// --- CRUD Operations for Staff ---
export const getStaffQuestions = async (): Promise<QuestionForStaff[]> => {
  try {
    const response = await apiClient.get<QuestionForStaff[]>('/staff/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff questions:', error);
    throw new Error('Failed to fetch questions. Please check your network connection and try again.');
  }
};

export const getQuestionById = async (id: number): Promise<QuestionForStaff> => {
  try {
    const response = await apiClient.get<QuestionForStaff>(`/staff/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw new Error('Failed to fetch question details. Please try again.');
  }
};

export const createQuestion = async (question: CreateQuestionDTO): Promise<QuestionForStaff> => {
  try {
    const response = await apiClient.post<QuestionForStaff>('/staff/questions', question);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question. Please try again.');
  }
};

export const updateQuestionInfo = async (id: number, question: UpdateQuestionInfoDTO): Promise<QuestionForStaff> => {
  try {
    const response = await apiClient.put<QuestionForStaff>(`/staff/questions/${id}`, question);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('Failed to update question. Please try again.');
  }
};

export const updateQuestionStatus = async (id: number, status: UpdateQuestionStatusDTO): Promise<QuestionForStaff> => {
  try {
    const response = await apiClient.patch<QuestionForStaff>(`/staff/questions/${id}/status`, status);
    return response.data;
  } catch (error) {
    console.error('Error updating question status:', error);
    throw new Error('Failed to update question status. Please try again.');
  }
};

export const importQuestionsFromExcel = async (file: File): Promise<{ message: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ message: string }>('/staff/questions/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Corrected 'multipart/form-Type' to 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing questions:', error);
    throw new Error('Failed to import questions from Excel. Please check the file format and try again.');
  }
};

// --- Analytics Operations ---
export const getQuestionsUsageRanking = async (
  categoryIds?: number[],
  startDate?: string,
  endDate?: string,
  orderByUsageDescending: boolean = true,
  topN: number = 10
): Promise<QuestionForStaff[]> => {
  try {
    const params = new URLSearchParams();

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => params.append('categoryIds', id.toString()));
    }
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('orderByUsageDescending', orderByUsageDescending.toString());
    params.append('topN', topN.toString());

    const response = await apiClient.get<QuestionForStaff[]>(`/staff/questions/usage-ranking?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions usage ranking:', error);
    throw new Error('Failed to fetch questions usage ranking. Please try again.');
  }
};

export const getCategoryUsageTrends = async (
  categoryIds?: number[],
  startDate?: string,
  endDate?: string,
  timeUnit: string = 'month'
): Promise<CategoryUsageTrend[]> => {
  try {
    const params = new URLSearchParams();

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => params.append('categoryIds', id.toString()));
    }
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('timeUnit', timeUnit);

    const response = await apiClient.get<CategoryUsageTrend[]>(`/staff/questions/category-trends?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category usage trends:', error);
    throw new Error('Failed to fetch category usage trends. Please try again.');
  }
};