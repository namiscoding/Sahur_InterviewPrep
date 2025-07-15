

import axios from 'axios';

const API_URL = 'https://localhost:2004/api/staff/categories'; 

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
  
    const response = await axios.get<Category[]>(API_URL); 
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error; 
  }
};