// File: src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import { SessionQuestionList } from './pages/history/question-list-answer';
import { AuthProvider } from './contexts/AuthContext';
import MockInterviewSetupPage from './pages/customer/MockInterviewSetupPage';
import QuestionManagementPage from './pages/Staff/QuestionManagementPage';
import QuestionAnalyticsPage from './pages/Staff/QuestionAnalyticsPage';
import SubscriptionUpgradePage from './pages/customer/SubscriptionUpgradePage';
import PaymentFailurePage from './pages/customer/PaymentFailurePage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage';
import CategoryManagementPage from './pages/Staff/CategoryManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import QuestionBankPage from './pages/customer/QuestionBankPage';
import PracticePage from './pages/customer/PracticePage';
import ResultPage from './pages/customer/ResultPage';
import { LoginForm } from './pages/Auth/Login';
import { RegisterForm } from './pages/Auth/Register';
import { ForgotPasswordForm } from './pages/Auth/ForgotPasswordForm';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import { UserProfile } from './pages/profile/update-profile';
import { ChangePassword } from './pages/profile/change-password';
import { PracticeHistory } from './pages/history/practice-history';
import UserAdminManagementPage from './pages/systemadmin/UserAdminManagementPage';
import SystemAdminTransactionsPage from './pages/systemadmin/SystemAdminTransactionsPage';
import SystemAdminUsageLimitsPage from './pages/systemadmin/SystemAdminUsageLimitsPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full">
          {/* Prioritize Toaster position from develop */}
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public Routes (accessible to everyone) - Combined from both branches */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* User upgrade account routes (from develop) */}
            <Route path="/upgrade" element={<SubscriptionUpgradePage />} />
            <Route path="/upgrade/fail" element={<PaymentFailurePage />} />
            <Route path="/upgrade/success" element={<PaymentSuccessPage />} />

            {/* User Profile & History Routes (typically for authenticated users) - Combined from both branches */}
            <Route path="/update-profile" element={<UserProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/practice-history" element={<PracticeHistory />} />
            {/* Add the unique route from your branch */}
            <Route path="/session-detail/:id" element={<SessionQuestionList />} />


            {/* Staff Routes (e.g., requires 'staff' or 'admin' role) - Combined from both branches */}
            <Route path="/staff/categories" element={<CategoryManagementPage />} />
            {/* QuestionManagementPage and QuestionAnalyticsPage from develop */}
            <Route path="/staff/questions" element={<QuestionManagementPage />} />
            <Route path="/staff/questions/analytics" element={<QuestionAnalyticsPage />} />
            {/* Add more staff routes as needed */}

            {/* Admin Routes (e.g., requires 'admin' role) - Combined from both branches */}
            <Route path="/admin/customers" element={<CustomerManagementPage />} />
            <Route path="/admin/staffs" element={<StaffManagementPage />} />
            {/* Add more admin routes as needed */}

            {/* SystemAdmin Routes */}
            <Route path="/systemadmin/useradmins" element={<UserAdminManagementPage />} />
            <Route path="/systemadmin/transactions" element={<SystemAdminTransactionsPage />} />
            <Route path="/systemadmin/usagelimits" element={<SystemAdminUsageLimitsPage />} />

            {/* Routes wrapped in Layout (from develop, includes /questions) */}
            <Route element={<Layout/>}>
                {/* Keep /questions here, as it's wrapped in Layout in develop */}
                <Route path="/questions" element={<QuestionBankPage />} />
                <Route path="/practice/session/:sessionId" element={<PracticePage />} />
                <Route path="/practice/result/:sessionId" element={<ResultPage />} />
                <Route path="/interview/setup" element={<MockInterviewSetupPage />} />
            </Route>

            {/* Optional: Catch-all route for 404 Not Found */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;