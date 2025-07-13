import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các trang của bạn
import HomePage from './pages/HomePage';
import CategoryManagementPage from './pages/staff/CategoryManagementPage'; 
import QuestionBankPage from './pages/customer/QuestionBankPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/staff/categories" element={<CategoryManagementPage />} />
          <Route path="/questions" element={<QuestionBankPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;