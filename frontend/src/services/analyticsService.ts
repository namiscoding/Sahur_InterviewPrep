import apiClient from './apiClient';
import { UserEngagementMetrics, StaffPerformance } from '../types/analytics.types';

export const getEngagementAnalytics = async (startDate?: Date, endDate?: Date): Promise<UserEngagementMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await apiClient.get<UserEngagementMetrics>(`/business/analytics/user-engagement`, { params });
    return response.data;
};
export const getStaffPerformance = async (startDate?: Date, endDate?: Date, staffId?: string): Promise<StaffPerformance[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (staffId) params.append('staffId', staffId);

    const response = await apiClient.get<StaffPerformance[]>(`/business/analytics/staff-performance`, { params });
    return response.data;
};