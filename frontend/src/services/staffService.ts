// src/services/staffService.ts
import axios from 'axios';

const API_URL = 'https://localhost:2004/api/useradmin/staff';

export interface StaffDTO {
  id: string;
  displayName: string;
  email: string;
  status: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface StaffDetailDTO extends StaffDTO {
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

export interface CreateStaffDTO {
  displayName: string;
  email: string;
}

export interface UpdateStaffStatusDTO {
  status: string;
}

export const getStaffs = async (
  search: string = '',
  status: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<StaffDTO>> => {
  try {
    const response = await axios.get<PagedResult<StaffDTO>>(API_URL, {
      params: { search, status, page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staffs:', error);
    throw error;
  }
};

export const getStaffDetails = async (id: string): Promise<StaffDetailDTO> => {
  try {
    const response = await axios.get<StaffDetailDTO>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff details:', error);
    throw error;
  }
};

export const createStaff = async (dto: CreateStaffDTO): Promise<StaffDTO> => {
  try {
    const response = await axios.post<StaffDTO>(API_URL, dto);
    return response.data;
  } catch (error: any) {
    console.error('Error creating staff:', error);
    const message = error?.response?.data?.title || error?.response?.data?.message || error.message || 'Unknown error';
    throw new Error(message);
  }
};

export const updateStaffStatus = async (id: string, dto: UpdateStaffStatusDTO): Promise<StaffDTO> => {
  try {
    const response = await axios.put<StaffDTO>(`${API_URL}/${id}/status`, dto);
    return response.data;
  } catch (error) {
    console.error('Error updating staff status:', error);
    throw error;
  }
};

export const resetStaffPassword = async (id: string): Promise<string> => {
  try {
    const response = await axios.post<string>(`${API_URL}/${id}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Error resetting staff password:', error);
    throw error;
  }
};