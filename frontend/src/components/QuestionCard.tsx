import React from 'react';
import { Question } from '../types/question.types';

interface Props {
  question: Question;
}

const QuestionCard: React.FC<Props> = ({ question }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '8px' }}>
      <h4>{question.content}</h4>
      <p><strong>Độ khó:</strong> {question.difficultyLevel}</p>
      <div>
        {question.tags.map(tag => (
          <span key={tag.id} style={{ background: '#eee', padding: '2px 8px', borderRadius: '12px', marginRight: '4px' }}>
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;