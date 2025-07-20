import axios from 'axios';

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

const API_BASE_URL = 'https://localhost:2004/api/statistics'; // hoặc đổi theo config của bạn

export const getRevenuePerMonth = async (monthsBack: number): Promise<MonthlyRevenue[]> => {
  const response = await axios.get<MonthlyRevenue[]>(`${API_BASE_URL}/revenue-per-month`, {
    params: { monthsBack },
  });
  return response.data;
};
