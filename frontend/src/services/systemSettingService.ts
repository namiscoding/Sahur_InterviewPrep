import axios from 'axios';

const API_URL = 'https://localhost:2004/api/systemadmin/systemsetting';

export interface SystemSettingDTO {
  settingKey: string;
  settingValue: string;
  description: string | null;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateSystemSettingDTO {
  settingKey: string;
  settingValue: string;
  description?: string;
}

export interface UpdateSystemSettingDTO {
  settingValue: string;
  description?: string;
}

export const getAllSystemSettings = async (
  prefix: string | null = null,
  search: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<SystemSettingDTO>> => {
  try {
    const params = { prefix, search, page, pageSize };
    console.log('API call params:', params);
    console.log('API URL:', API_URL);
    
    const response = await axios.get<PagedResult<SystemSettingDTO>>(API_URL, {
      params,
    });
    
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

export const getSystemSettingByKey = async (key: string): Promise<SystemSettingDTO> => {
  try {
    const response = await axios.get<SystemSettingDTO>(`${API_URL}/${key}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system setting details:', error);
    throw error;
  }
};

export const createSystemSetting = async (dto: CreateSystemSettingDTO): Promise<SystemSettingDTO> => {
  try {
    const response = await axios.post<SystemSettingDTO>(API_URL, dto);
    return response.data;
  } catch (error) {
    console.error('Error creating system setting:', error);
    throw error;
  }
};

export const updateSystemSetting = async (key: string, dto: UpdateSystemSettingDTO): Promise<SystemSettingDTO> => {
  try {
    const response = await axios.put<SystemSettingDTO>(`${API_URL}/${key}`, dto);
    return response.data;
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
};