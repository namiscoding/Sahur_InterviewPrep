// File: src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

import { SessionQuestionList } from './pages/history/question-list-answer';
import { AuthProvider } from './contexts/AuthContext';
import MockInterviewSetupPage from './pages/customer/MockInterviewSetupPage';
import InterviewSessionPage from './pages/customer/InterviewSessionPage';
import InterviewResultPage from './pages/customer/InterviewResultPage';
import QuestionManagementPage from './pages/staff/QuestionManagementPage';
import QuestionAnalyticsPage from './pages/staff/QuestionAnalyticsPage';
import SubscriptionUpgradePage from './pages/customer/SubscriptionUpgradePage';
import PaymentFailurePage from './pages/customer/PaymentFailurePage';
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage';
import Layout from './components/layout/Layout'
import UserAdminLayout from './components/layout/UserAdminLayout'
import SystemAdminLayout from './components/layout/SystemAdminLayout'
import HomePage from './pages/HomePage';
import UserAdminDashboard from './pages/admin/UserAdminDashboard';
import SystemAdminDashboard from './pages/systemadmin/SystemAdminDashboard';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import CategoryManagementPage from './pages/staff/CategoryManagementPage';
import QuestionBankPage from './pages/customer/QuestionBankPage';
import PracticePage from './pages/customer/PracticePage';
import ResultPage from './pages/customer/ResultPage';
import { LoginForm } from './pages/auth/Login';
import { RegisterForm } from './pages/auth/Register';
import { ForgotPasswordForm } from './pages/auth/ForgotPasswordForm';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserProfile from './pages/profile/update-profile';
import { ChangePassword } from './pages/profile/change-password';
import { PracticeHistory } from './pages/history/practice-history';
import SubscriptionPlanManagementPage from './pages/admin/SubscriptionPlanManagementPage';
import AuditLogManagementPage from './pages/admin/AuditLogManagementPage'
import UserAdminManagementPage from './pages/systemadmin/UserAdminManagementPage';
import SystemAdminTransactionsPage from './pages/systemadmin/SystemAdminTransactionsPage';
import SystemAdminUsageLimitsPage from './pages/systemadmin/SystemAdminUsageLimitsPage';
import UserEngagementPage from './pages/admin/UserEngagementPage';
import StaffPerformancePage from './pages/admin/StaffPerformancePage';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full">
          {/* Prioritize Toaster position from develop */}
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
          <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<Layout/>}>
              {/* Business Admin Pages */}
              <Route path="/business/users" element={<UserEngagementPage />} />
              <Route path="/business/staffs" element={<StaffPerformancePage />} />
              <Route path="/business/questions" element={<QuestionAnalyticsPage />} />
              <Route path="/staff-dashboard" element={<HomePage />} />
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
              {/* Add more staff routes as needed */}

              {/* UserAdmin Routes with Layout */}
              <Route path="/admin/dashboard" element={<UserAdminDashboard />} />
              <Route path="/admin/customers" element={<CustomerManagementPage />} />
              <Route path="/admin/staffs" element={<StaffManagementPage />}/>
              <Route path="/admin/subcriptionPlan" element={<SubscriptionPlanManagementPage />} />
              <Route path="/admin/audit-log" element={<AuditLogManagementPage />} />

              {/* SystemAdmin Routes with Layout */}
              <Route path="/business/dashboard" element={<SystemAdminDashboard />} />
              <Route path="/systemadmin/useradmins" element={<UserAdminManagementPage />} />
              <Route path="/business/transactions" element={<SystemAdminTransactionsPage />} />
              <Route path="/systemadmin/usagelimits" element={<SystemAdminUsageLimitsPage />} />

            {/* Routes wrapped in Layout (from develop, includes /questions) */}
            
                {/* Keep /questions here, as it's wrapped in Layout in develop */}
                <Route path="/" element={<QuestionBankPage />} />
                <Route path="/questions" element={<QuestionBankPage />} />
                <Route path="/practice/session/:sessionId" element={<PracticePage />} />
                <Route path="/practice/result/:sessionId" element={<ResultPage />} />
                <Route path="/interview/setup" element={<MockInterviewSetupPage />} />
                <Route path="/interview/session/:sessionId" element={<InterviewSessionPage />} />
                <Route path="/interview/result/:sessionId" element={<InterviewResultPage />} />
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