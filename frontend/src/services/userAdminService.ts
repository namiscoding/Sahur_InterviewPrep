// File: src/services/userAdminService.ts
import axios from 'axios';

const API_URL = 'https://localhost:2004/api/systemadmin/useradmin';

export interface UserAdminDTO {
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

export interface CreateUserAdminDTO {
  displayName: string;
  email: string;
}

export interface UpdateUserAdminStatusDTO {
  status: string;
}

export const getUserAdmins = async (
  search: string = '',
  status: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<UserAdminDTO>> => {
  try {
    const response = await axios.get<PagedResult<UserAdminDTO>>(API_URL, {
      params: { search, status, page, pageSize },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user admins:', error);
    throw error;
  }
};

export const getUserAdminDetails = async (id: string): Promise<UserAdminDTO> => {
  try {
    const response = await axios.get<UserAdminDTO>(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user admin details:', error);
    throw error;
  }
};

export const createUserAdmin = async (dto: CreateUserAdminDTO): Promise<UserAdminDTO> => {
  try {
    const response = await axios.post<UserAdminDTO>(API_URL, dto);
    return response.data;
  } catch (error: any) {
    console.error('Error creating user admin:', error);
    const message = error?.response?.data?.title || error?.response?.data?.message || error.message || 'Unknown error';
    throw new Error(message);
  }
};

export const updateUserAdminStatus = async (id: string, dto: UpdateUserAdminStatusDTO): Promise<UserAdminDTO> => {
  try {
    const response = await axios.put<UserAdminDTO>(`${API_URL}/${id}/status`, dto);
    return response.data;
  } catch (error) {
    console.error('Error updating user admin status:', error);
    throw error;
  }
};

export const resetUserAdminPassword = async (id: string): Promise<string> => {
  try {
    const response = await axios.post<string>(`${API_URL}/${id}/reset-password`);
    return response.data;
  } catch (error) {
    console.error('Error resetting user admin password:', error);
    throw error;
  }
};