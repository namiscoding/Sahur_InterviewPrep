import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMockSessionResult } from '../../services/practiceService';
import { MockSession, SessionAnswer } from '../../types';

// UI components & Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, CheckCircle, AlertTriangle, MessageSquareQuote, Eye, EyeOff, User, XCircle, PartyPopper } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// --- Các hàm Helper và Component Tùy Chỉnh ---
const getScoreAppearance = (score?: number | null) => {
    if (score == null) return { textColor: "text-gray-500", progressColorClass: "bg-gray-400", icon: <XCircle className="w-6 h-6" />, label: "Chưa trả lời" };
    if (score < 40) return { textColor: "text-red-600", progressColorClass: "bg-red-600", icon: <XCircle className="w-6 h-6" />, label: "Cần cải thiện nhiều" };
    if (score < 75) return { textColor: "text-yellow-600", progressColorClass: "bg-yellow-500", icon: <AlertTriangle className="w-6 h-6" />, label: "Khá tốt" };
    return { textColor: "text-green-600", progressColorClass: "bg-green-600", icon: <CheckCircle className="w-6 h-6" />, label: "Xuất sắc!" };
};

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
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


const InterviewResultPage: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<MockSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleSampleAnswers, setVisibleSampleAnswers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!sessionId) { navigate('/dashboard'); return; }
        const fetchResult = async () => {
            try {
                const resultData = await getMockSessionResult(parseInt(sessionId));
                setSession(resultData);
            } catch (error) { console.error("Failed to fetch session result:", error); } 
            finally { setLoading(false); }
        };
        fetchResult();
    }, [sessionId, navigate]);

    const toggleSampleAnswer = (questionId: number) => {
        setVisibleSampleAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }
    if (!session) {
        return <div className="text-center p-8">Không tìm thấy kết quả.</div>;
    }
    
    const overallAppearance = getScoreAppearance(session.overallScore);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Về Dashboard
                    </Button>
                    <Button onClick={() => navigate('/interview/setup')}>
                        <PartyPopper className="mr-2 h-4 w-4"/>
                        Tạo bài phỏng vấn mới
                    </Button>
                </div>

                <Card className="mb-8">
                    <CardHeader><CardTitle>Kết Quả Tổng Quan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className={`flex items-center justify-between font-bold text-xl ${overallAppearance.textColor}`}>
                            <div className="flex items-center gap-2">{overallAppearance.icon}<span>{overallAppearance.label}</span></div>
                            <span className="text-4xl font-bold">{session.overallScore?.toFixed(0) ?? 'N/A'} / 100</span>
                        </div>
                        <div>
                            <CustomProgressBar 
                                value={session.overallScore ?? 0} 
                                colorClassName={overallAppearance.progressColorClass}
                            />
                        </div>
                    </CardContent>
                </Card>

                <h2 className="text-2xl font-bold mb-4">Chi tiết từng câu trả lời</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {session.answers.map((answer, index) => {
                        const appearance = getScoreAppearance(answer.score);
                        return (
                            <AccordionItem value={`item-${index}`} key={answer.question.id} className="bg-white border rounded-lg shadow-sm">
                                <AccordionTrigger className="flex flex-col items-start text-left hover:no-underline p-4">
                                   <div className="flex items-center flex-wrap gap-2 mb-2 w-full">
                                        {answer.question.categories.map(cat => (
                                            <Badge key={cat.id} variant="outline" className="text-blue-600 border-blue-200">{cat.name}</Badge>
                                        ))}
                                        <Badge variant="outline" className={getDifficultyColor(answer.question.difficultyLevel)}>
                                            {answer.question.difficultyLevel}
                                        </Badge>
                                        <div className="flex-grow"></div> {/* Đẩy điểm số sang phải */}
                                        <span className={`font-bold flex-shrink-0 ${appearance.textColor}`}>
                                            {answer.score ?? 'Bỏ qua'}
                                        </span>
                                    </div>
                                    {/* Phần tiêu đề câu hỏi */}
                                    <span className="font-semibold text-gray-800">
                                        Câu {index + 1}: {answer.question.content}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 border-t">
                                    <div className="space-y-6 mt-4">
                                        <Card>
                                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User /> Câu trả lời của bạn</CardTitle></CardHeader>
                                            <CardContent className="prose-sm max-w-none text-gray-700">
                                                {answer.userAnswer || <span className="italic text-gray-500">Bạn đã bỏ qua câu này.</span>}
                                            </CardContent>
                                        </Card>
                                        
                                        {answer.feedback && (
                                            <>
                                                <Card>
                                                    <CardHeader><CardTitle className="text-base">Điểm số chi tiết</CardTitle></CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className={`flex items-center justify-between font-bold text-lg ${appearance.textColor}`}>
                                                            <div className="flex items-center gap-2">{appearance.icon}<span>{appearance.label}</span></div>
                                                            <span className="text-2xl font-bold">{answer.score} / 100</span>
                                                        </div>
                                                        <div>
                                                            <CustomProgressBar value={answer.score ?? 0} colorClassName={appearance.progressColorClass} />
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-blue-50 border-blue-200">
                                                    <CardHeader><CardTitle className="text-base flex items-center gap-2 text-blue-800"><MessageSquareQuote /> Nhận xét chung</CardTitle></CardHeader>
                                                    <CardContent><p className="text-blue-900">{answer.feedback.overall}</p></CardContent>
                                                </Card>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <Card className="border-green-200 bg-green-50/50">
                                                        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-green-700"><CheckCircle /> Điểm mạnh</CardTitle></CardHeader>
                                                        <CardContent>
                                                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                                                {answer.feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        </CardContent>
                                                    </Card>
                                                    <Card className="border-yellow-200 bg-yellow-50/50">
                                                        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-yellow-700"><AlertTriangle /> Điểm cần cải thiện</CardTitle></CardHeader>
                                                        <CardContent>
                                                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                                                {answer.feedback.improvements.map((item, i) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </>
                                        )}
                                        {answer.question.sampleAnswer && (
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex justify-between items-center">
                                                        <CardTitle className="text-base">Câu trả lời mẫu</CardTitle>
                                                        <Button variant="outline" size="sm" onClick={() => toggleSampleAnswer(answer.question.id)}>
                                                            {visibleSampleAnswers[answer.question.id] ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                                            {visibleSampleAnswers[answer.question.id] ? 'Ẩn' : 'Hiện'}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                {visibleSampleAnswers[answer.question.id] && (
                                                    <CardContent className="prose-sm max-w-none pt-4 border-t text-gray-800">
                                                        {answer.question.sampleAnswer}
                                                    </CardContent>
                                                )}
                                            </Card>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </div>
    );
};

export default InterviewResultPage;