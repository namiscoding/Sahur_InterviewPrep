import React from 'react';
import { Question } from '../types/question.types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Tag as TagIcon } from 'lucide-react';

// 1. Cập nhật Props: Thêm onStartPractice
interface QuestionDetailModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: (question: Question) => void; // Prop mới
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

// 2. Nhận prop onStartPractice
const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ question, isOpen, onClose, onStartPractice }) => {
  if (!isOpen || !question) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            {question.categories.map(cat => (
                <span key={cat.id} className="text-sm font-medium text-blue-600">{cat.name}</span>
            ))}
            <Badge variant="outline" className={getDifficultyColor(question.difficultyLevel)}>
              {question.difficultyLevel}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">{question.content}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {question.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          {/* 3. Thêm sự kiện onClick cho button */}
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => onStartPractice(question)}
          >
            <Play className="w-4 h-4 mr-2" /> Luyện tập câu hỏi này
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDetailModal;