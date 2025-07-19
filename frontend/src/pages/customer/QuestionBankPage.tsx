import React, { useState, useEffect, useCallback } from 'react';
import { getPublicQuestions } from '../services/questionService';
import { Question, PaginatedResult } from '../../types/question.types';
import QuestionList from '../../components/QuestionList';
import Pagination from '../../components/Pagination';
import QuestionFilters from '../../components/QuestionFilters'; // 1. Import component

const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResult<any>, 'items'>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State `filters` giờ sẽ được cập nhật bởi component con
  const [filters, setFilters] = useState<GetQuestionsParams>({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    categoryId: undefined,
    difficultyLevel: undefined,
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getQuestions(filters);
      setQuestions(result.items);
      const { items, ...paginationData } = result;
      setPagination(paginationData);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [filters]); 

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handlePageChange = (page: number) => {
    setFilters(prevFilters => ({ ...prevFilters, pageNumber: page }));
  };

  const handleFilterChange = (newFilters: Omit<GetQuestionsParams, 'pageNumber' | 'pageSize'>) => {
    // Reset về trang 1 mỗi khi có bộ lọc mới
    setFilters(prevFilters => ({ 
      ...prevFilters, 
      ...newFilters, 
      pageNumber: 1 
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ngân Hàng Câu Hỏi</h1>
      
      {/* 2. Thêm component Filters và truyền hàm callback vào */}
      <QuestionFilters onFilterChange={handleFilterChange} />
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <QuestionList questions={questions} loading={loading} />

      {!loading && pagination && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default QuestionBankPage;