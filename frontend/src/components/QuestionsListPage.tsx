import React, { useState, useEffect } from 'react';
import { getQuestions } from '../services/questionService';
import { Question } from '../types/question.types';
import QuestionCard from '../components/QuestionCard';

const QuestionsListPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await getQuestions();
        setQuestions(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách câu hỏi.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần khi component mount

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Danh sách câu hỏi phỏng vấn</h2>
      {questions.length > 0 ? (
        questions.map(q => <QuestionCard key={q.id} question={q} />)
      ) : (
        <p>Không có câu hỏi nào.</p>
      )}
    </div>
  );
};

export default QuestionsListPage;