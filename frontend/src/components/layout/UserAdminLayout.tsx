import React from 'react';
import { Outlet } from 'react-router-dom';
import UserAdminSidebar from './UserAdminSidebar';

const UserAdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <UserAdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserAdminLayout; 