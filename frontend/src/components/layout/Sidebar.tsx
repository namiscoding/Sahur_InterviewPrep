import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  BookOpen,
  MessageSquare,
  History,
  Crown,
  Users,
  Settings,
  BarChart3,
  Shield,
  Activity,
  FileText,
  Play,
  CreditCard
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // 2. Thay thế user từ context bằng một vai trò cố định
  const { user } = useAuth();  

  const getNavItems = () => {
    const commonItems = [
      { to: '/', icon: Home, label: 'Home' }
    ];

    if (!user?.roles) {
      return commonItems;
    }

    if (user.roles.includes('Customer')) {
      return [
        ...commonItems,
        { to: '/questions', icon: BookOpen, label: 'Question Bank' },
        { to: '/interview/setup', icon: Play, label: 'Start Interview' },
        { to: '/practice-history', icon: History, label: 'Practice History' },
        { to: '/upgrade', icon: Crown, label: 'Upgrade Account' },
        { to: '/update-profile', icon: Settings, label: 'Profile' }
      ];
    }
    if (user.roles.includes('Staff')) {
        return [
          ...commonItems,
          { to: '/staff-dashboard', icon: BookOpen, label: 'Dashboard' },
          { to: '/staff/questions', icon: BookOpen, label: 'Questions' },
          { to: '/staff/categories', icon: FileText, label: 'Categories' },
        ];
    }
    if (user.roles.includes('UserAdmin')) {
        return [
          ...commonItems,
          { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
          { to: '/admin/customers', icon: Users, label: 'Customer Management' },
          { to: '/admin/staffs', icon: Users, label: 'Staff Management' },
        ];
    }
    if (user.roles.includes('SystemAdmin')) {
        return [
          ...commonItems,
          { to: '/systemadmin/dashboard', icon: BarChart3, label: 'Dashboard' },
          { to: '/systemadmin/usagelimits', icon: Settings, label: 'System Settings' },
          { to: '/systemadmin/transactions', icon: CreditCard, label: 'Transaction Management' },
          { to: '/systemadmin/useradmins', icon: Users, label: 'UserAdmin Management' },
          { to: '/admin/audit-log', icon: Activity , label: 'Audit Logs' },
        ];
    }
    if (user.roles.includes('BusinessAdmin')) {
        return [
          ...commonItems,
          { to: '/business/questions', icon: BarChart3, label: 'Questions' },
          { to: '/admin/audit-log', icon: Activity , label: 'Audit Logs' }
        ];
    }
    return commonItems;
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