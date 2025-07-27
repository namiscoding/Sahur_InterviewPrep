import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Question, MockSession } from '../../types';
import { submitAnswerForMockInterview, completeFullMockInterview } from '../../services/practiceService';
import { transcribeAudio } from '../../services/speechService';
import { toast } from 'react-hot-toast';

// UI components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Icons
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Timer, Loader2, Send, PartyPopper, Mic } from 'lucide-react';

// --- Các hàm Helper ---
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getTimerAppearance = (timeLeft: number) => {
    if (timeLeft <= 30) {
        return "text-red-500 font-bold text-xl";
    }
    if (timeLeft <= 60) {
        return "text-yellow-600 font-bold text-lg";
    }
    return "text-gray-700 font-semibold text-base";
};

const InterviewSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();

  const initialSession: MockSession | undefined = location.state?.sessionData;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submissionStatus, setSubmissionStatus] = useState<Record<number, 'pending' | 'submitting' | 'submitted'>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  
  // State cho Speech-to-Text
  const [isListening, setIsListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [hasDetectedSpeech, setHasDetectedSpeech] = useState(false);

  useEffect(() => {
    if (!initialSession?.questions?.length) {
              toast.error("Session data not found.");
      navigate('/interview/setup');
      return;
    }

    const sessionQuestions = initialSession.questions;
    setQuestions(sessionQuestions);
    setTimeLeft(sessionQuestions.length * 90);

    const initialAnswers: Record<number, string> = {};
    const initialStatus: Record<number, 'pending' | 'submitting' | 'submitted'> = {};
    sessionQuestions.forEach(q => {
        initialAnswers[q.id] = '';
        initialStatus[q.id] = 'pending';
    });
    setAnswers(initialAnswers);
    setSubmissionStatus(initialStatus);
  }, [initialSession, navigate]);
  
  const handleAttemptLeave = (path: string) => {
      if (!isCompleting) {
        setNextLocation(path);
        setShowLeaveConfirm(true);
      } else {
        navigate(path);
      }
  };

  const handleCompleteInterview = useCallback(async (isTimeUp = false) => {
      if (!sessionId || isCompleting) return;
      setIsCompleting(true);
      if (isTimeUp) toast.error("Time's up!");
      try {
        const finalSession = await completeFullMockInterview(parseInt(sessionId));
        toast.success("Congratulations! You have completed the interview!");
        navigate(`/interview/result/${sessionId}`, { state: { resultData: finalSession } });
      } catch (error) {
        toast.error("Failed to complete interview.");
        setIsCompleting(false);
      }
  }, [sessionId, navigate, isCompleting]);

  useEffect(() => {
    if (timeLeft <= 0 && questions.length > 0 && !isCompleting) {
      handleCompleteInterview(true);
      return;
    }
    const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, questions, isCompleting, handleCompleteInterview]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
  };

  const goToNext = () => setCurrentQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
  const goToPrev = () => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion || submissionStatus[currentQuestion.id] !== 'pending') return;
    setSubmissionStatus(prev => ({ ...prev, [currentQuestion.id]: 'submitting' }));
    try {
      await submitAnswerForMockInterview(parseInt(sessionId), {
        questionId: currentQuestion.id,
        userAnswer: answers[currentQuestion.id]
      });
      setSubmissionStatus(prev => ({ ...prev, [currentQuestion.id]: 'submitted' }));
      toast.success(`Answer submitted for question ${currentQuestionIndex + 1}`);
      if (currentQuestionIndex < totalQuestions - 1) {
        goToNext();
      }
    } catch (error) {
      toast.error("Failed to submit answer.");
      setSubmissionStatus(prev => ({ ...prev, [currentQuestion.id]: 'pending' }));
    }
  };
  
  const handleToggleRecording = async () => {
    if (isListening && mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasDetectedSpeech(false);
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        const checkAudioActivity = () => {
            if (!recorder || recorder.state !== 'recording') return;
            analyser.getByteTimeDomainData(dataArray);
            let sumSquares = 0.0;
            for (const amplitude of dataArray) {
                const val = (amplitude / 128.0) - 1.0;
                sumSquares += val * val;
            }
            if (Math.sqrt(sumSquares / dataArray.length) > 0.02) {
                setHasDetectedSpeech(true);
            }
            requestAnimationFrame(checkAudioActivity);
        };

        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        const audioChunks: Blob[] = [];
        recorder.ondataavailable = (event) => audioChunks.push(event.data);

        recorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          await audioContext.close();
          if (!hasDetectedSpeech) {
            toast.error("No speech detected.");
            return;
          }
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setTranscribing(true);
          try {
            const text = await transcribeAudio(audioBlob, 'vi');
            setAnswers(prev => ({...prev, [currentQuestion.id]: (prev[currentQuestion.id] || '') + text }));
            toast.success('Speech converted to text!');
          } catch (error) {
            toast.error('Unable to process speech.');
          } finally {
            setTranscribing(false);
          }
        };
        
        recorder.start();
        setIsListening(true);
        checkAudioActivity();
      } catch (error) {
        toast.error("Unable to access microphone.");
      }
    }
  };

  if (!currentQuestion) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
            <Button 
                variant="ghost" 
                onClick={() => handleAttemptLeave('/interview/setup')} 
                className="text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại trang cài đặt
            </Button>
            <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowCompleteConfirm(true)}
                disabled={isCompleting}
            >
                <PartyPopper className="mr-2 h-4 w-4" />
                Hoàn thành bài phỏng vấn
            </Button>
        </div>

        <div className="mb-6 space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}</span>
                <div className={`flex items-center gap-2 ${getTimerAppearance(timeLeft)}`}>
                    <Timer className="w-5 h-5" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
            </div>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} />
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {currentQuestion.categories.map(cat => (
                  <Badge key={cat.id} variant="outline" className="text-blue-600 border-blue-200">{cat.name}</Badge>
              ))}
              <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficultyLevel)}>
                {currentQuestion.difficultyLevel}
              </Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight">
              {currentQuestion.content}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Nhập câu trả lời của bạn ở đây..."
                rows={12}
                value={answers[currentQuestion.id] || ''}
                onChange={handleAnswerChange}
                className="text-base resize-none"
                disabled={submissionStatus[currentQuestion.id] === 'submitted'}
              />
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className={`rounded-full transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''}`}
                    onClick={handleToggleRecording}
                    disabled={transcribing || submissionStatus[currentQuestion.id] === 'submitted'}
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <p className="text-sm text-gray-600">
                  {isListening 
                    ? "Nhấn lần nữa để dừng..." 
                    : transcribing 
                      ? "Đang xử lý giọng nói..."
                      : "Nhấn vào micro để trả lời bằng giọng nói."
                  }
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={goToPrev} disabled={currentQuestionIndex === 0}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Câu trước
                    </Button>
                    <Button variant="outline" onClick={goToNext} disabled={currentQuestionIndex === totalQuestions - 1}>
                        Câu sau <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                {submissionStatus[currentQuestion.id] === 'submitted' ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="w-5 h-5" /> Đã nộp
                    </div>
                ) : (
                    <Button onClick={handleSubmitAnswer} disabled={!answers[currentQuestion.id] || submissionStatus[currentQuestion.id] === 'submitting'}>
                        {submissionStatus[currentQuestion.id] === 'submitting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Nộp câu trả lời
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn rời đi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tiến trình làm bài của bạn sẽ không được lưu nếu bạn rời khỏi trang này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (nextLocation) {
                  navigate(nextLocation);
                }
              }}
            >
              Rời đi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn chắc chắn muốn hoàn thành?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sẽ không thể quay lại trả lời các câu hỏi đã bỏ qua. Hệ thống sẽ chấm điểm và kết thúc phiên phỏng vấn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCompleteInterview()}>
              Hoàn thành
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InterviewSessionPage;