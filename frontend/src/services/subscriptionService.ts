import apiClient from './apiClient'; // Import apiClient bạn đã cung cấp

export const subscriptionService = {
  /**
   * Fetches all active subscription plans.
   * Corresponds to GET /api/subscription/plans
   */
  getSubscriptionPlans: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/subscription/plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Initiates an upgrade payment.
   * Corresponds to POST /api/payment/upgrade/initiate
   */
  initiateUpgradePayment: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/payment/upgrade/initiate', data);
      return response.data;
    } catch (error: any) {
      console.error('Error initiating upgrade payment:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Fetches current user profile.
   * Corresponds to GET /api/user/profile
   */
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
