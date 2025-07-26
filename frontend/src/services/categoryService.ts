import apiClient from './apiClient';

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CategoryForCustomer {
  id: number;
  name: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  isActive?: boolean; // Mặc định là true ở backend, nhưng vẫn có thể gửi từ frontend
}

export interface UpdateCategoryStatusDTO {
  isActive: boolean;
}

export interface UpdateCategoryInfoDTO {
  name: string;
  description?: string;
}

// --- Chức năng cho Staff ---
export const getStaffCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/staff/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff categories:', error);
    throw new Error('Failed to fetch categories. Please check your network connection and try again.');
  }
};

// --- Chức năng cho Customer/Public ---
export const getPublicCategories = async (): Promise<CategoryForCustomer[]> => {
  try {
    const response = await apiClient.get<CategoryForCustomer[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching public categories:', error);
    throw new Error('Failed to fetch public categories. Please check your network connection and try again.');
  }
};

// --- CRUD Operations for Staff ---
export const createCategory = async (category: CreateCategoryDTO): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>('/staff/categories', category);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category. Please try again.');
  }
};

export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/staff/categories/${id}`, category);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category. Please try again.');
  }
};

export const updateCategoryStatus = async (id: number, statusDto: UpdateCategoryStatusDTO): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/staff/categories/${id}/status`, statusDto);
    return response.data;
  } catch (error) {
    console.error('Error updating category status:', error);
    throw new Error('Failed to update category status. Please try again.');
  }
};

export const updateCategoryInfo = async (id: number, infoDto: UpdateCategoryInfoDTO): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/staff/categories/${id}`, infoDto);
    return response.data;
  } catch (error) {
    console.error('Error updating category info:', error);
    throw new Error('Failed to update category information. Please try again.');
  }
};

export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await apiClient.get<Category>(`/staff/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to fetch category details. Please try again.');
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/staff/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category. Please try again.');
  }
};

