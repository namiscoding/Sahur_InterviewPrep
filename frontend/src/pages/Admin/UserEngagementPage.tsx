import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, PlayCircle, CheckCircle2, Percent, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { getEngagementAnalytics } from '../../services/analyticsService';
import { UserEngagementMetrics } from '@/types/analytics.types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Component thẻ chỉ số được nâng cấp
const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ElementType;
    description?: string;
}> = ({ title, value, icon: Icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const UserEngagementPage: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
    });
    const [metrics, setMetrics] = useState<UserEngagementMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const data = await getEngagementAnalytics(dateRange?.from, dateRange?.to);
            setMetrics(data);
        } catch (error) {
            console.error("Failed to fetch engagement metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Phân Tích Tương Tác Người Dùng</h1>
                    <p className="text-gray-500">Các chỉ số hoạt động của người dùng trên nền tảng.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Chọn ngày</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={fetchMetrics} disabled={loading}>
                        {loading ? "Đang tải..." : "Áp dụng"}
                    </Button>
                </div>  
            </div>

            {loading ? (
                <div className="text-center py-12">Loading metrics...</div>
            ) : metrics ? (
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Cột bên trái cho các chỉ số chính */}
                    <div className="lg:col-span-2 space-y-6">
                        <StatCard title="Người dùng hoạt động" value={metrics.activeUsers} icon={Users} description={`Trong khoảng thời gian đã chọn`} />
                        <StatCard title="Phiên bắt đầu" value={metrics.sessionsStarted} icon={PlayCircle} />
                        <StatCard title="Phiên hoàn thành" value={metrics.sessionsCompleted} icon={CheckCircle2} />
                        <StatCard title="Tỷ lệ hoàn thành" value={`${metrics.completionRate}%`} icon={Percent} />
                        <StatCard title="Thời gian trung bình (giây)" value={metrics.averageSessionDurationSeconds} icon={Clock} />
                    </div>
                     <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Người Dùng Hoạt Động Hàng Ngày</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* SỬ DỤNG TRỰC TIẾP RECHARTS */}
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <LineChart data={metrics.dailyActiveUsers} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" fontSize={12} />
                                        <YAxis allowDecimals={false} fontSize={12}/>
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="activeUsers" 
                                            stroke="#1d4ed8" // Màu xanh dương đậm
                                            strokeWidth={2} 
                                            dot={{ r: 4 }} 
                                            activeDot={{ r: 6 }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <p>Không thể tải dữ liệu.</p>
            )}
        </div>
    );
};

export default UserEngagementPage;