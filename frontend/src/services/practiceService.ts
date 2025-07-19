import apiClient from './apiClient';
import { MockSession, SubmitAnswerResponse, CreateFullInterviewRequest  } from '../types/practice.types'; // Đảm bảo bạn có các type này

export const startPracticeSession = async (questionId: number): Promise<MockSession> => {
  const response = await apiClient.post<MockSession>('/practice/start-single', { questionId });
  return response.data;
};

export const submitAnswer = async (sessionId: number, userAnswer: string): Promise<SubmitAnswerResponse> => {
  const response = await apiClient.post<SubmitAnswerResponse>(
    `/practice/sessions/${sessionId}/submit-single`, 
    { userAnswer }
  );
  return response.data;
};

export const startFullMockInterview = async (request: CreateFullInterviewRequest): Promise<MockSession> => {
  const response = await apiClient.post<MockSession>('/practice/start-full', request);
  return response.data;
};