import React from 'react';
import { NavLink } from 'react-router-dom';
// 1. Xóa import useAuth
// import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  BookOpen,
  MessageSquare,
  History,
  Crown,
  Settings,
  Play
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // 2. Thay thế user từ context bằng một vai trò cố định
  const userRole = 'Customer'; 

  const getNavItems = () => {
    const commonItems = [
      { to: '/staff-dashboard', icon: Home, label: 'Dashboard' }
    ];

    // 3. Switch case giờ sẽ luôn chạy vào trường hợp 'Customer'
    switch (userRole) {
      case 'Customer':
        return [
          ...commonItems,
          { to: '/questions', icon: BookOpen, label: 'Question Bank' },
          { to: '/interview/setup', icon: Play, label: 'Start Interview' },
          { to: '/practice', icon: MessageSquare, label: 'Quick Practice' },
          { to: '/practice-history', icon: History, label: 'Practice History' },
          { to: '/upgrade', icon: Crown, label: 'Upgrade Account' },
          { to: '/update-profile', icon: Settings, label: 'Profile' }
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <nav className="p-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;