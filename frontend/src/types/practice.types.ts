import { Question } from './question.types';


export interface Feedback {
  overall: string;
  strengths: string[];
  improvements: string[];
}

export interface SubmitAnswerResponse {
  sessionAnswerId: number;
  score: number;
  feedback: Feedback;
}


export interface MockSession {
  id: number;
  status: string; 
  sessionType: string; 
  startedAt: string;
  questions: Question[];
}

export interface CreateFullInterviewRequest {
  categoryIds: number[];
  difficultyLevels: string[];
  numberOfQuestions: number;
}