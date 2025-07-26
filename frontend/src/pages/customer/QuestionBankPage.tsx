import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Services và Types
import { getQuestions, GetQuestionsParams } from '../../services/questionService';
import { startPracticeSession } from '../../services/practiceService';
import { Question, PaginatedResult } from '../../types';

// Components
import QuestionFilters from '../../components/QuestionFilters';
import Pagination from '../../components/Pagination';
import QuestionDetailModal from '../../components/QuestionDetailModal';

// UI
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Hàm helper
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();

  // State cho dữ liệu và giao diện chính
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<any>, 'items'>>();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GetQuestionsParams>({ pageNumber: 1, pageSize: 8 });

  // State để quản lý modal xem chi tiết
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Logic fetch dữ liệu
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getQuestions(filters);
      setQuestions(result.items);
      const { items, ...paginationData } = result;
      setPagination(paginationData);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error("Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // --- Các hàm xử lý (Handlers) ---

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("❌ Token không tồn tại.");
      return;
    }

    try {
      const res = await fetch("https://localhost:2004/api/user/full-profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("❌ Không thể lấy thông tin người dùng.");

      const data = await res.json();
    } catch (err: any) {
      toast.error(err.message || "❌ Lỗi khi tải thông tin người dùng.");
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  const handleFilterChange = (newFilters: Omit<GetQuestionsParams, 'pageNumber' | 'pageSize'>) => {
    setFilters(prev => ({ ...prev, ...newFilters, pageNumber: 1 }));
  };
  
  const handleStartPractice = async (question: Question) => {
    try {
        const session = await startPracticeSession(question.id);
        // Đóng modal chi tiết và điều hướng đến trang luyện tập
        setSelectedQuestion(null);
        navigate(`/practice/session/${session.id}`, { 
            state: { questionData: question } 
        });
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          toast.error('Bạn cần đăng nhập để thực hiện chức năng này.');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          return; 
        }
         // Xử lý lỗi 403 - Hết lượt sử dụng
        if (axiosError.response?.status === 403) {
          const errorMessage = "Bạn đã hết lượt sử dụng miễn phí.";
          toast.error(
            (t) => (
              <div className="flex flex-col items-start gap-2">
                <span>{errorMessage}</span>
                <Button
                  variant="default"
                  color='green'
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    navigate('/upgrade'); 
                    toast.dismiss(t.id); 
                  }}
                >
                  Nâng cấp tài khoản
                </Button>
              </div>
            ),
            { duration: 6000 } 
          );
          return; 
        }
      }
      console.error("Failed to start practice session:", error);
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
        <h1 className="text-3xl font-bold">Ngân Hàng Câu Hỏi</h1>
        <p className="text-blue-100 mt-2">
          Duyệt và thực hành với bộ sưu tập {pagination?.totalCount ?? 0} câu hỏi phỏng vấn của chúng tôi
        </p>
      </div>

      <QuestionFilters onFilterChange={handleFilterChange} />

      {/* Questions Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy câu hỏi</h3>
            <p className="text-gray-600">Hãy thử điều chỉnh lại bộ lọc của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {questions.map((question) => (
            <Card 
              key={question.id}
              className="hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              onClick={() => setSelectedQuestion(question)}
            >
              <CardContent className="p-6 space-y-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                               <span className="text-sm font-medium text-blue-600">{question.categories.map(c => c.name).join(', ')}</span>
                               <Badge variant="outline" className={`text-xs ${getDifficultyColor(question.difficultyLevel)}`}>
                                 {question.difficultyLevel}
                               </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{question.content}</h3>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-wrap gap-1">
                       {question.tags.slice(0, 3).map((tag) => (
                         <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                       ))}
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600">
                       <Eye className="w-4 h-4" />
                       <span className="text-sm">Xem chi tiết</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
            <Pagination
                currentPage={pagination.pageNumber}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCount}
                itemsPerPage={pagination.pageSize}
                onPageChange={handlePageChange}
            />
        </div>
      )}

      {/* Modal Chi Tiết Câu Hỏi */}
      <QuestionDetailModal
        isOpen={selectedQuestion !== null}
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        onStartPractice={handleStartPractice}
      />
    </div>
  );
};

export default QuestionBankPage;