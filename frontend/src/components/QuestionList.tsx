import React from 'react';
import { Question } from '../types/question.types';
import QuestionCard from './QuestionCard'; 

interface Props {
  questions: Question[];
  loading: boolean;
}

const QuestionList: React.FC<Props> = ({ questions, loading }) => {
  if (loading) {
    return <div>Đang tải danh sách câu hỏi...</div>;
  }

  if (questions.length === 0) {
    return <div>Không tìm thấy câu hỏi nào.</div>;
  }

  return (
    <div>
      {questions.map(question => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
};

export default QuestionList;