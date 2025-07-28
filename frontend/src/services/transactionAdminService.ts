// File: src/services/transactionAdminService.ts
import axios from 'axios';

const API_URL = 'https://localhost:2004/api/systemadmin/transactions';

export interface TransactionListDTO {
  id: number;
  transactionCode: string;
  userId: string;
  customerDisplayName: string;
  customerEmail: string;
  transactionDate: string;
  amount: number;
  currency: string;
  status: string;
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  paymentMethod: string;
}

export interface TransactionDetailDTO extends TransactionListDTO {
  gatewayTransactionId: string | null;
  externalTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TransactionFilterDTO {
  search?: string;
  customerSearch?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export interface TransactionStatisticsDTO {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
  totalRevenue: number;
  completedRevenue: number;
  successRate: number;
  revenueByCurrency: RevenueByCurrencyDTO[];
  lastTransactionDate: string | null;
  firstTransactionDate: string | null;
}

export interface RevenueByCurrencyDTO {
  currency: string;
  totalAmount: number;
  transactionCount: number;
}

export const getAllTransactions = async (filter: TransactionFilterDTO): Promise<PagedResult<TransactionListDTO>> => {
  try {
    const response = await axios.get<PagedResult<TransactionListDTO>>(API_URL, {
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionDetails = async (id: number): Promise<TransactionDetailDTO> => {
  try {
    const response = await axios.get<TransactionDetailDTO>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};

export const getTransactionStatistics = async (filter: TransactionFilterDTO): Promise<TransactionStatisticsDTO> => {
  try {
    const response = await axios.get<TransactionStatisticsDTO>(`${API_URL}/statistics`, {
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    throw error;
  }
};