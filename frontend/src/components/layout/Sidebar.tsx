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
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-gray-50 to-white shadow-lg border-r border-gray-200 overflow-y-auto">
      <nav className="p-6">
        {user?.roles?.includes('SystemAdmin') ? (
          <div className="space-y-8 mt-4">
            {/* System Admin Header */}
            <div className="text-center pb-4 border-b border-gray-200 pt-4">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">System Admin</h3>
            </div>
            
            {/* Analytics Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Analytics</h4>
              <NavLink
                to="/systemadmin/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`
                }
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </div>

            {/* Management Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Management</h4>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/systemadmin/usagelimits"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                      }`
                    }
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">System Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/systemadmin/transactions"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                      }`
                    }
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Transactions</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/systemadmin/useradmins"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                      }`
                    }
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">UserAdmin Management</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Security Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Security</h4>
              <NavLink
                to="/admin/audit-log"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                  }`
                }
              >
                <Activity className="w-5 h-5" />
                <span className="font-medium">Audit Logs</span>
              </NavLink>
            </div>
          </div>
        ) : (
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
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;