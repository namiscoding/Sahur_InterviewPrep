export interface DailyDataPoint {
  date: string;
  activeUsers: number;
}

export interface UserEngagementMetrics {
    startDate: string;
    endDate: string;
    activeUsers: number;
    sessionsStarted: number;
    sessionsCompleted: number;
    completionRate: number;
    averageSessionDurationSeconds: number;
    dailyActiveUsers: DailyDataPoint[];
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  staffEmail: string;
  questionsCreated: number;
  totalQuestionUsage: number;
  averageScoreOnQuestions?: number;
}