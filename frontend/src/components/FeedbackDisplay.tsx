import React from 'react';
import { Feedback } from '../types/practice.types'; // Type cho Feedback có cấu trúc
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, MessageSquareQuote } from 'lucide-react';

interface FeedbackDisplayProps {
  feedback: Feedback;
  score: number;
  onClose: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, score, onClose }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Kết quả của bạn</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-gray-600">Điểm số đạt được</p>
          <p className="text-6xl font-bold text-blue-600 my-4">{score.toFixed(1)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquareQuote /> Nhận xét chung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{feedback.overall}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700"><CheckCircle2 /> Điểm mạnh</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {feedback.strengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700"><AlertTriangle /> Điểm cần cải thiện</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {feedback.improvements.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button onClick={onClose}>Quay lại Ngân hàng câu hỏi</Button>
      </div>
    </div>
  );
};

export default FeedbackDisplay;