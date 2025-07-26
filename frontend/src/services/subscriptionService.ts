import apiClient from './apiClient';

// Định nghĩa các kiểu dữ liệu cho DTOs và Models
export interface SubscriptionPlan {
    id: number;
    name: string;
    level: number; // Enum: 0=Free, 2=Premium (dựa trên thông tin của bạn)
    durationMonths: number;
    price: number;
    currency: string;
    isActive: boolean;
}

export interface CreateSubscriptionPlanDTO {
    name: string;
    level: number;
    durationMonths: number;
    price: number;
    currency: string;
}

export interface UpdateSubscriptionPlanInfoDTO {
    name: string;
    level: number;
    durationMonths: number;
    price: number;
    currency: string;
}

export interface UpdateSubscriptionPlanStatusDTO {
    isActive: boolean;
}

// Helper function to map SubscriptionLevel enum value to text
export const mapSubscriptionLevelText = (level: number): string => {
    switch (level) {
        case 0: return 'Free';
        case 2: return 'Premium';
        default: return 'Unknown Level'; // RẤT NÊN THÊM DÒNG NÀY để xử lý các giá trị không mong muốn
    }
};

// Base URL for staff subscription plan endpoints
const STAFF_API_BASE_URL = '/subscription/staff/subscription-plans';

export const subscriptionService = {
    getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
        try {
            const response = await apiClient.get(STAFF_API_BASE_URL);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching subscription plans:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch subscription plans');
        }
    },

    getSubscriptionPlanById: async (id: number): Promise<SubscriptionPlan> => {
        try {
            const response = await apiClient.get(`${STAFF_API_BASE_URL}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching subscription plan with ID ${id}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.message || `Failed to fetch subscription plan with ID ${id}`);
        }
    },

    updateSubscriptionPlanInfo: async (id: number, data: UpdateSubscriptionPlanInfoDTO): Promise<SubscriptionPlan> => {
        try {
            const response = await apiClient.put<SubscriptionPlan>(`${STAFF_API_BASE_URL}/${id}`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating subscription plan info for ID ${id}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.message || `Failed to update subscription plan info for ID ${id}`);
        }
    },

    updateSubscriptionPlanStatus: async (id: number, data: UpdateSubscriptionPlanStatusDTO): Promise<SubscriptionPlan> => {
        try {
            const response = await apiClient.patch<SubscriptionPlan>(`${STAFF_API_BASE_URL}/${id}/status`, data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating subscription plan status for ID ${id}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.message || `Failed to update subscription plan status for ID ${id}`);
        }
    },

    initiateUpgradePayment: async (data: any): Promise<any> => {
        try {
            const response = await apiClient.post('/payment/upgrade/initiate', data);
            return response.data;
        } catch (error: any) {
            console.error('Error initiating upgrade payment:', error.response?.data || error.message);
            throw error;
        }
    },

    getCurrentUserProfile: async (): Promise<any> => {
        try {
            const response = await apiClient.get('/user/profile');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching current user profile:', error.response?.data || error.message);
            throw error;
        }
    },
};

// Helper function to get auth token (if needed)
const getAuthToken = (): string | null => {
    return localStorage.getItem('jwt_token'); 
};