import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, UserCheck, BarChart3, Home } from 'lucide-react';

const UserAdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      title: 'Customer Management',
      path: '/admin/customers',
      icon: Users,
    },
    {
      title: 'Staff Management',
      path: '/admin/staffs',
      icon: UserCheck,
    },
  ];

  return (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">UserAdmin Panel</h2>
        <p className="text-sm text-gray-600">Manage customers and staff</p>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 mb-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">UserAdmin</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdminSidebar; 