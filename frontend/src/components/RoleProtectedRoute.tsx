import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component này nhận vào một mảng các vai trò được phép
interface Props {
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Kiểm tra xem đã đăng nhập chưa
  if (!isAuthenticated) {
    // Nếu chưa, chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra xem vai trò của người dùng có được phép không
  // So sánh vai trò của user với danh sách vai trò được phép
  const isAllowed = user?.roles.some(role => allowedRoles.includes(role));

  if (!isAllowed) {
    // Nếu không được phép, chuyển hướng đến trang "Không có quyền" (hoặc trang chủ)
    // Bạn có thể tạo một trang /unauthorized để thông báo lỗi đẹp hơn
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Nếu mọi thứ đều ổn, cho phép hiển thị trang
  return <Outlet />;
};

export default RoleProtectedRoute;