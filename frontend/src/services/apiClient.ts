import axios from 'axios';

// 1. Định nghĩa API_BASE_URL ở đây
const API_BASE_URL = 'https://localhost:2004/api'; 

// 2. Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Cấu hình interceptor để tự động đính kèm token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;