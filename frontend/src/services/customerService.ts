// src/services/customerService.ts
import axios from 'axios';

const API_URL = 'https://localhost:2004/api/useradmin/customers';

export interface UserDTO {
  id: string;
  displayName: string;
  email: string;
  status: string;
  subscriptionLevel: string;
  subscriptionExpiryDate?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UserDetailDTO extends UserDTO {
  transactions: TransactionDTO[];
  mockSessions: MockSessionDTO[];
  usageLogs: UsageLogDTO[];
}

export interface TransactionDTO {
  id: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface MockSessionDTO {
  id: number;
  sessionType: string;
  status: string;
  startedAt: string;
}

export interface UsageLogDTO {
  id: number;
  actionType: string;
  usageTimestamp: string;
}

export interface UpdateUserStatusDTO {
  status: string;
}

export interface UpdateSubscriptionDTO {
  subscriptionLevel: string;
  subscriptionExpiryDate?: string;
  reason: string;
}

export const getCustomers = async (
  search: string = '',
  status: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<UserDTO>> => {
  try {
    const response = await axios.get<PagedResult<UserDTO>>(API_URL, {
      params: { search, status, page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerDetails = async (id: string): Promise<UserDetailDTO> => {
  try {
    const response = await axios.get<UserDetailDTO>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

export const updateCustomerStatus = async (id: string, dto: UpdateUserStatusDTO): Promise<UserDTO> => {
  try {
    const response = await axios.put<UserDTO>(`${API_URL}/${id}/status`, dto);
    return response.data;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};

export const updateCustomerSubscription = async (id: string, dto: UpdateSubscriptionDTO): Promise<UserDTO> => {
  try {
    const response = await axios.put<UserDTO>(`${API_URL}/${id}/upgrade`, dto);
    return response.data;
  } catch (error) {
    console.error('Error updating customer subscription:', error);
    throw error;
  }
};