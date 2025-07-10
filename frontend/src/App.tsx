import React, { useState } from 'react';
import CategoryManagementPage from './pages/Staff/CategoryManagementPage';

type Page = "home" | "categories";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "categories":
        return <CategoryManagementPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

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