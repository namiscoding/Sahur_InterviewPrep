import React, { useEffect, useState } from 'react'
import CategoryManagementPage from './pages/Staff/CategoryManagementPage';
import { LoginForm } from './pages/Auth/Login';
import { RegisterForm } from './pages/Auth/Register';
import { ForgotPasswordForm } from './pages/Auth/ForgotPasswordForm';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import { UserProfile } from './pages/profile/update-profile';
import { ChangePassword } from './pages/profile/change-password';
import { Toaster } from "react-hot-toast"
import { PracticeHistory } from './pages/history/practice-history';
type Page =
  | "home"
  | "categories"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password" | "update-profile" | "change-password" | "practice-history"


function App() {
  const [currentPage, setCurrentPage] = useState<String>("login")
  const [resetParams, setResetParams] = useState<{ email: string; token: string }>({
    email: "",
    token: ""
  })


  const navigate = (page: String, data?: any) => {
    if (page === "reset-password" && data) {
      setResetParams({ email: data.email, token: data.token })
    }
    if (page === "update-profile" && data?.token) {
      localStorage.setItem("token", data.token); // 👈 đảm bảo token được lưu
    }
    setCurrentPage(page)
  }
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const email = searchParams.get("email")
    const token = searchParams.get("token")
    const path = window.location.pathname

    // Ưu tiên reset-password nếu có token
    if (email && token) {
      navigate("reset-password", { email, token })
      return
    }

    // Còn lại map path sang page
    switch (path) {
      case "/update-profile":
        navigate("update-profile")
        break
      case "/categories":
        navigate("categories")
        break
      case "/home":
        navigate("home")
        break
      case "/login":
        navigate("login")
        break
      case "/register":
        navigate("register")
        break
      case "/forgot-password":
        navigate("forgot-password")
        break
      case "/change-password":
        navigate("change-password")
        break
      case "/practice-history":
        navigate("practice-history")
        break
      default:
        navigate("login") // fallback
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "categories":
        return <CategoryManagementPage onNavigate={navigate} />;

      case "login":
        return (
          <LoginForm
            onLogin={() => setCurrentPage("home")} // hoặc navigate("home")
            onNavigate={navigate}
          />
        );

      case "register":
        return (
          <RegisterForm
            onRegister={() => navigate("login")}
            onNavigate={navigate}
          />
        );

      case "forgot-password":
        return <ForgotPasswordForm onNavigate={navigate} />

      case "reset-password":
        return <ResetPasswordPage onNavigate={navigate} resetParams={resetParams} />
      case "update-profile":
        return <UserProfile onNavigate={navigate} />;
      case "change-password":
        return <ChangePassword onNavigate={navigate} />
      case "practice-history":
  return <PracticeHistory onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };
  return (
    <div className="min-h-screen w-full">
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
      {renderPage()}
    </div>
  );
  // Add w-full to ensure full width
  return <div className="min-h-screen w-full">{renderPage()}</div>;
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Prep System</h1>
              <p className="mt-2 text-gray-600">Manage your interview preparation platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Category Management Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigate("categories")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Management
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Manage question categories for the interview system
            </p>
            <div className="flex items-center text-blue-600 hover:text-blue-800">
              <span className="text-sm font-medium">Manage Categories</span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Placeholder for future features */}
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-400 mb-2">Questions</h3>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-400 mb-2">Users</h3>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;