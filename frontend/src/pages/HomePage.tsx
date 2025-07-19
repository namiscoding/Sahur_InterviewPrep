import { Link } from 'react-router-dom'; 

function HomePage() {
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
          <Link to="/staff/categories" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>

          {/* Question Management Card */}
          <Link to="/staff/questions" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Management
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Manage interview questions and their properties
            </p>
            <div className="flex items-center text-green-600 hover:text-green-800">
              <span className="text-sm font-medium">Manage Questions</span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Question Analytics Card */}
          <Link to="/staff/questions/analytics" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                Insights
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              View question usage statistics and trends
            </p>
            <div className="flex items-center text-purple-600 hover:text-purple-800">
              <span className="text-sm font-medium">View Analytics</span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

  {/* Account Upgrade Card */}
<Link to="/upgrade" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upgrade Account</h3>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Premium
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Upgrade to premium for unlimited access and advanced features
            </p>
            <div className="flex items-center text-yellow-600 hover:text-yellow-800">
              <span className="text-sm font-medium">Upgrade Now</span>
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default HomePage;