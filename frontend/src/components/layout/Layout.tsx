import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import Header from './Header'; // Đảm bảo đường dẫn đúng
import Sidebar from './Sidebar'; // Đảm bảo đường dẫn đúng

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="pt-16 pl-64">
        <div className="p-6">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default MainLayout;