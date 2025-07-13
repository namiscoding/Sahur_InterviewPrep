import apiClient from './apiClient'

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
// --- Chức năng cho Staff (Hàm cũ của team member) ---
// Giữ nguyên hàm cũ, có thể đổi tên cho rõ ràng hơn
export const getStaffCategories = async (): Promise<Category[]> => {
  try {
    // Gọi đến endpoint của staff
    const response = await apiClient.get<Category[]>(`/staff/categories`); 
    return response.data;
  } catch (error) {
    console.error('Error fetching staff categories:', error);
    throw error; 
  }
};

// --- Chức năng cho Customer/Public (Hàm mới của bạn) ---
// Đây là hàm bạn cần cho bộ lọc ở trang Question Bank
export const getPublicCategories = async (): Promise<CategoryForCustomer[]> => {
  try {
    // Gọi đến endpoint công khai hoặc của customer
    const response = await apiClient.get<CategoryForCustomer[]>(`/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public categories:', error);
    throw error;
  }
};

