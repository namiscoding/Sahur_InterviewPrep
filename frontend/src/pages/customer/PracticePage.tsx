import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Question, SubmitAnswerResponse } from '../../types';
import { submitAnswer } from '../../services/practiceService';

// UI components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Icons - Dọn dẹp các import bị trùng lặp
import { 
    Mic, Send, Loader2, ArrowLeft, 
    CheckCircle, AlertTriangle, MessageSquareQuote, 
    Eye, EyeOff, XCircle, User, AlertCircle 
} from 'lucide-react';

// --- Các hàm Helper ---
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
const getScoreAppearance = (score: number) => {
    if (score < 40) {
        return {
            color: "text-red-600",
            progressColorClass: "bg-red-600",
            icon: <XCircle className="w-6 h-6" />,
            label: "Cần cải thiện nhiều"
        };
    }
    if (score < 75) {
        return {
            color: "text-yellow-500",
            progressColorClass: "bg-yellow-400",
            icon: <AlertCircle className="w-6 h-6" />,
            label: "Khá tốt"
        };
    }
    return {
        color: "text-green-600",
        progressColorClass: "bg-green-600",
        icon: <CheckCircle className="w-6 h-6" />,
        label: "Xuất sắc!"
    };
};

// Component Progress Bar tùy chỉnh của bạn
const CustomProgressBar: React.FC<{ value: number; colorClassName: string }> = ({ value, colorClassName }) => {
    return (
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${colorClassName}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
};


// === COMPONENT CHÍNH: PRACTICE PAGE ===
const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();

  const question: Question | undefined = location.state?.questionData;

  const [view, setView] = useState<'answering' | 'viewing_result'>('answering');
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  useEffect(() => {
    if (!question) navigate('/questions');
  }, [question, navigate]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !sessionId) return;
    setIsSubmitting(true);
    try {
      const resultData = await submitAnswer(parseInt(sessionId), userAnswer);
      setResult(resultData);
      setView('viewing_result');
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question) return null;
  
  const appearance = result ? getScoreAppearance(result.score) : getScoreAppearance(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate('/questions')} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại Ngân hàng câu hỏi
            </Button>
            {view === 'viewing_result' && (
                <Button onClick={() => {
                    setView('answering');
                    setUserAnswer('');
                    setResult(null);
                }}>
                    Làm lại câu hỏi này
                </Button>
            )}
        </div>

        {/* --- Phần Thông Tin Câu Hỏi (Luôn hiển thị) --- */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {question.categories.map(cat => (
                  <Badge key={cat.id} variant="outline" className="text-blue-600 border-blue-200">{cat.name}</Badge>
              ))}
              <Badge variant="outline" className={getDifficultyColor(question.difficultyLevel)}>
                {question.difficultyLevel}
              </Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight">
              {question.content}
            </CardTitle>
          </CardHeader>
          
          {/* --- Phần Nội Dung Động (Trả lời hoặc Kết quả) --- */}
          <CardContent className="p-6">
            {view === 'answering' ? (
              // --- Giao diện TRẢ LỜI ---
              <div className="space-y-4">
                <Textarea
                  placeholder="Hãy trình bày câu trả lời của bạn ở đây..."
                  rows={12}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="text-base resize-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border">
                  <Button 
                      variant="outline" size="icon" 
                      className={`rounded-full transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''}`}
                      onClick={() => setIsListening(!isListening)}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-gray-600">{isListening ? "Đang lắng nghe..." : "Hoặc nhấn vào micro để trả lời bằng giọng nói."}</p>
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSubmit} disabled={isSubmitting || !userAnswer.trim()} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Nộp bài & Xem kết quả
                  </Button>
                </div>
              </div>

            ) : result && (
              // --- Giao diện KẾT QUẢ ---
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-gray-800"><User className="w-5 h-5" /> Câu trả lời của bạn</CardTitle></CardHeader>
                  <CardContent className="prose-sm max-w-none text-gray-700">{userAnswer}</CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Điểm số của bạn</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`flex items-center justify-between font-bold text-xl ${appearance.color}`}>
                        <div className="flex items-center gap-2">{appearance.icon}<span>{appearance.label}</span></div>
                        <span className="text-4xl font-bold">{result.score} / 100</span>
                    </div>
                    <div>
                        <CustomProgressBar 
                          value={result.score} 
                          colorClassName={appearance.progressColorClass}
                        />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                   <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800"><MessageSquareQuote /> Nhận xét chung</CardTitle></CardHeader>
                   <CardContent><p className="text-blue-900">{result.feedback.overall}</p></CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-green-700"><CheckCircle className="w-5 h-5" /> Điểm mạnh</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-none pl-0 space-y-2 text-gray-700">
                          {result.feedback.strengths.map((item, index) => <li key={index} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" /><span>{item}</span></li>)}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50/50">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-700"><AlertTriangle /> Điểm cần cải thiện</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-none pl-0 space-y-2 text-gray-700">
                          {result.feedback.improvements.map((item, index) => <li key={index} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-1 text-yellow-500 flex-shrink-0" /><span>{item}</span></li>)}
                        </ul>
                      </CardContent>
                    </Card>
                </div>
                
                {question.sampleAnswer && (
                  <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Câu trả lời mẫu</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setShowSampleAnswer(!showSampleAnswer)}>
                                {showSampleAnswer ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                {showSampleAnswer ? 'Ẩn' : 'Hiện'}
                            </Button>
                        </div>
                    </CardHeader>
                    {showSampleAnswer && (
                        <CardContent className="prose-sm max-w-none pt-4 border-t text-gray-800">{question.sampleAnswer}</CardContent>
                    )}
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticePage;