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

export interface CreateStaffDTO {
  displayName: string;
  email: string;
  password: string;
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

export const getStaffDetails = async (id: string): Promise<StaffDTO> => {
  try {
    const response = await axios.get<StaffDTO>(`${API_URL}/${id}`);
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
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
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