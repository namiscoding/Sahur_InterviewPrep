import React from 'react';
import { Outlet } from 'react-router-dom';
import SystemAdminSidebar from './SystemAdminSidebar';

const SystemAdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SystemAdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SystemAdminLayout; 