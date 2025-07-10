// frontend-web/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//import CategoryManagementPage from './pages/Staff/CategoryManagementPage'; // Đảm bảo đường dẫn này đúng
import Test5 from './pages/Test5';

// Xóa hoặc comment nội dung mặc định của Vite/React nếu nó ở đây
// Ví dụ: function App() { const [count, setCount] = useState(0) ... }

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', backgroundColor: '#333', color: 'white' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '20px' }}>
            <li>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            </li>
            <li>
              <Link to="/staff/categories" style={{ color: 'white', textDecoration: 'none' }}>Manage Categories</Link>
            </li>
            {/* Bạn có thể thêm các link điều hướng khác ở đây */}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<h1 style={{textAlign: 'center', marginTop: '50px'}}>Welcome to Interview Prep!</h1>} /> {/* Trang chủ đơn giản */}
          {/* <Route path="/staff/categories" element={<CategoryManagementPage />} /> */}
          <Route path="/test" element={<Test5/>}/>
          {/* Thêm các Route khác cho các chức năng sau này */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;