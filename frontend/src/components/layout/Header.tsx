import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 1. Import và sử dụng useAuth
import { User, LogOut, Settings, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 2. Lấy user và hàm logout từ context
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout(); // 3. Gọi hàm logout từ context, nó sẽ tự xử lý mọi thứ
    navigate('/login'); // Điều hướng về trang login sau khi logout
    setShowDropdown(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SystemAdmin': return 'bg-red-100 text-red-800';
      case 'UserAdmin': return 'bg-purple-100 text-purple-800';
      case 'BusinessAdmin': return 'bg-orange-100 text-orange-800'; // Thêm màu cho BusinessAdmin
      case 'Staff': return 'bg-blue-100 text-blue-800';
      case 'Customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 4. Nếu chưa có user (chưa đăng nhập), không hiển thị gì cả
  if (!user) {
    return null;
  }

  // Lấy vai trò đầu tiên để hiển thị (trong trường hợp user có nhiều vai trò)
  const displayRole = user?.roles?.[0] ?? 'User';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mock Interview Platform</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  {/* 5. Sử dụng dữ liệu thật từ context */}
                  <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getRoleColor(displayRole)}`}>
                    {displayRole}
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => navigate("/update-profile")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;