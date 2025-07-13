import apiClient from './apiClient'; 
export interface Tag {
  id: number;
  name: string;
}
export const getAllTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>('/tags');
  return response.data;
};  