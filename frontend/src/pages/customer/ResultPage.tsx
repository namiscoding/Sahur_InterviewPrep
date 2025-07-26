import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedbackDisplay from '../../components/FeedbackDisplay'; // Import component hiển thị feedback

const ResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu kết quả được truyền qua state của router
    const resultData = location.state?.resultData;

    // Nếu không có dữ liệu (ví dụ: người dùng truy cập trực tiếp URL),
    // hiển thị một thông báo và nút để quay về.
    if (!resultData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4">
                <h1 className="text-2xl font-bold mb-2">Không có dữ liệu kết quả</h1>
                <p className="text-gray-600 mb-4">Không tìm thấy kết quả cho phiên làm bài này.</p>
                <button 
                    onClick={() => navigate('/questions')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Quay lại Ngân hàng câu hỏi
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <FeedbackDisplay 
                    feedback={resultData.feedback}
                    score={resultData.score}
                    // Khi người dùng nhấn nút đóng, sẽ điều hướng về trang Question Bank
                    onClose={() => navigate('/questions')} 
                />
            </div>
        </div>
    );
};

export default ResultPage;