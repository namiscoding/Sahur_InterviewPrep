import React, { useState } from 'react';
import { SubmitAnswerResponse } from '../types/practice.types';
import { Question } from '../types/question.types'
import { submitAnswer } from '../services/practiceService';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, Send, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  sessionData: { sessionId: number; question: Question };
  onClose: () => void;
  onComplete: (result: SubmitAnswerResponse) => void;
}

const PracticeSessionModal: React.FC<Props> = ({ isOpen, sessionData, onClose, onComplete }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State giả cho speech-to-text
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await submitAnswer(sessionData.sessionId, userAnswer);
      onComplete(result); // Gửi kết quả về cho component cha
    } catch (error) {
      console.error("Failed to submit answer:", error);
      // TODO: Hiển thị lỗi cho người dùng
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{sessionData.question.content}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Textarea
            placeholder="Nhập câu trả lời của bạn ở đây..."
            rows={10}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="text-base"
          />
          {/* Giao diện cho Speech-to-text */}
          <div className="flex items-center gap-4 p-2 rounded-lg bg-gray-50">
            <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full ${isListening ? 'bg-red-500 text-white' : ''}`}
                onClick={() => setIsListening(!isListening)} // Logic giả
            >
              <Mic className="w-5 h-5" />
            </Button>
            <p className="text-sm text-gray-500">
              {isListening ? "Đang lắng nghe..." : "Hoặc nhấn vào micro để trả lời bằng giọng nói."}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Nộp bài
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PracticeSessionModal;