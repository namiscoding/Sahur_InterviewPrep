// File: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all necessary page components
import HomePage from './pages/HomePage'; // From develop (assuming a similar HomePage will exist)
import CategoryManagementPage from './pages/Staff/CategoryManagementPage'; // Exists in both, taking from user-admin structure
import CustomerManagementPage from './pages/Admin/CustomerManagementPage'; // From user-admin
import StaffManagementPage from './pages/Admin/StaffManagementPage'; // From user-admin
import QuestionBankPage from './pages/customer/QuestionBankPage'; // From develop

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Routes>
          {/* Main home route */}
          <Route path="/" element={<HomePage />} />

          {/* Admin routes */}
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
          <Route path="/admin/staffs" element={<StaffManagementPage />} />

          {/* Staff routes */}
          <Route path="/staff/categories" element={<CategoryManagementPage />} />
          {/* Assuming staff-related management for questions might be under staff as well, or a different role */}

          {/* Customer routes (e.g., viewing questions) */}
          <Route path="/questions" element={<QuestionBankPage />} />

          {/* Optionally, add a catch-all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;