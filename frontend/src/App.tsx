// File: src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "react-hot-toast"; // Keep Toaster for notifications

// Import all necessary page components from both branches
import HomePage from './pages/HomePage'; // Assuming this component exists and is now route-driven
import CategoryManagementPage from './pages/staff/CategoryManagementPage';
import CustomerManagementPage from './pages/Admin/CustomerManagementPage';
import StaffManagementPage from './pages/Admin/StaffManagementPage';
import QuestionBankPage from './pages/customer/QuestionBankPage';

// Authentication related pages
import { LoginForm } from './pages/Auth/Login';
import { RegisterForm } from './pages/Auth/Register';
import { ForgotPasswordForm } from './pages/Auth/ForgotPasswordForm';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'; // This page will handle URL params (email, token) internally
import { UserProfile } from './pages/profile/update-profile';
import { ChangePassword } from './pages/profile/change-password';
import { PracticeHistory } from './pages/history/practice-history';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public Routes (accessible to everyone) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          {/* ResetPasswordPage will read email and token from URL search params internally using useSearchParams */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/questions" element={<QuestionBankPage />} />

          {/* User Profile & History Routes (typically for authenticated users) */}
          <Route path="/update-profile" element={<UserProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/practice-history" element={<PracticeHistory />} />

          {/* Staff Routes (e.g., requires 'staff' or 'admin' role) */}
          <Route path="/staff/categories" element={<CategoryManagementPage />} />
          {/* Add more staff routes as needed */}

          {/* Admin Routes (e.g., requires 'admin' role) */}
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
          <Route path="/admin/staffs" element={<StaffManagementPage />} />
          {/* Add more admin routes as needed */}

          {/* Optional: Catch-all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;