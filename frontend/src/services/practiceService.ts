import apiClient from './apiClient';
import { MockSession, SubmitAnswerResponse, CreateFullInterviewRequest,SubmitFullInterviewAnswerRequest  } from '../types/practice.types'; // Đảm bảo bạn có các type này

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

export const submitAnswerForMockInterview = async (
  sessionId: number, 
  answerData: SubmitFullInterviewAnswerRequest
): Promise<{ sessionAnswerId: number }> => {
  const response = await apiClient.post<{ sessionAnswerId: number }>(
    `/practice/sessions/${sessionId}/submit-answer`, 
    answerData
  );
  return response.data;
};

export const completeFullMockInterview = async (sessionId: number): Promise<MockSession> => {
  const response = await apiClient.post<MockSession>(`/practice/sessions/${sessionId}/complete`);
  return response.data;
};

export const getMockSessionResult = async (sessionId: number): Promise<MockSession> => {
  const response = await apiClient.get<MockSession>(`/practice/sessions/${sessionId}`);
  return response.data;
};