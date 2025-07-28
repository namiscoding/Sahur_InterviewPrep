import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getStaffPerformance } from '../../services/analyticsService';
import { StaffPerformance } from '@/types/analytics.types';
import { getAllStaffForSelection, StaffForSelection } from '../../services/staffService';
import { Loader2, Calendar as CalendarIcon, ArrowUpDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

type SortKey = keyof StaffPerformance;

const StaffPerformancePage: React.FC = () => {
    // State cho bộ lọc
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });
    const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

    // State cho dữ liệu
    const [performanceData, setPerformanceData] = useState<StaffPerformance[]>([]);
    const [staffList, setStaffList] = useState<StaffForSelection[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho việc sắp xếp bảng
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
        key: 'totalQuestionUsage', 
        direction: 'desc' 
    });

    // Fetch danh sách nhân viên cho bộ lọc
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const staff = await getAllStaffForSelection();
                setStaffList(staff);
                await fetchReport(dateRange, 'all'); // Tải báo cáo lần đầu
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Hàm gọi API để lấy báo cáo
    const fetchReport = async (currentDateRange?: DateRange, currentStaffId?: string) => {
        setLoading(true);
        try {
            const staffId = (currentStaffId === 'all' || !currentStaffId) ? undefined : currentStaffId;
            const data = await getStaffPerformance(currentDateRange?.from, currentDateRange?.to, staffId);
            setPerformanceData(data);
        } catch (error) {
            console.error("Failed to fetch staff performance:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Sắp xếp dữ liệu bằng useMemo để tối ưu hiệu năng
    const sortedData = useMemo(() => {
        let sortableData = [...performanceData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? 0;
                const bValue = b[sortConfig.key] ?? 0;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [performanceData, sortConfig]);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Báo Cáo Hiệu Suất Nhân Viên</h1>
                <p className="text-gray-500">Đánh giá hiệu quả đóng góp nội dung của đội ngũ.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Chọn ngày</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus /></PopoverContent>
                </Popover>

                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả nhân viên</SelectItem>
                        {staffList.map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>{staff.displayName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={() => fetchReport(dateRange, selectedStaffId)} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Áp dụng
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kết quả chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => handleSort('staffName')} className="cursor-pointer">Tên Nhân Viên <ArrowUpDown className="inline-block ml-2 h-4 w-4" /></TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead onClick={() => handleSort('questionsCreated')} className="cursor-pointer text-center">Câu hỏi đã tạo <ArrowUpDown className="inline-block ml-2 h-4 w-4" /></TableHead>
                                <TableHead onClick={() => handleSort('totalQuestionUsage')} className="cursor-pointer text-center">Tổng lượt dùng <ArrowUpDown className="inline-block ml-2 h-4 w-4" /></TableHead>
                                <TableHead onClick={() => handleSort('averageScoreOnQuestions')} className="cursor-pointer text-right">Điểm trung bình <ArrowUpDown className="inline-block ml-2 h-4 w-4" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Đang tải dữ liệu...</TableCell></TableRow>
                            ) : sortedData.length > 0 ? sortedData.map((staff) => (
                                <TableRow key={staff.staffId}>
                                    <TableCell className="font-medium">{staff.staffName}</TableCell>
                                    <TableCell>{staff.staffEmail}</TableCell>
                                    <TableCell className="text-center">{staff.questionsCreated}</TableCell>
                                    <TableCell className="text-center">{staff.totalQuestionUsage}</TableCell>
                                    <TableCell className="text-right">{staff.averageScoreOnQuestions?.toFixed(2) ?? 'N/A'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Không có dữ liệu.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffPerformancePage;