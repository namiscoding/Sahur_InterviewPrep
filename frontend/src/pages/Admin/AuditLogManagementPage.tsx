import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    SAAuditLogDTO, // Using new DTO
    AuditLogFilterParams,
    auditLogService
} from '../../services/auditLogService';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar component
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // For className utility

// Icons
import { Calendar as CalendarIcon, RefreshCw, ArrowLeft, Filter, Search, User, Zap } from "lucide-react";


const AuditLogManagementPage: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<SAAuditLogDTO[]>([]); // Using new DTO
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filters, setFilters] = useState<AuditLogFilterParams>({
        userName: '',
        userRole: 'all', // "Admin", "Staff", "Customer", "No Role", "all"
        area: 'all',    // "Category", "Question", "Subscription Plan", "User", "Unknown", "all"
        actionType: 'all', // "Added", "Updated", "Deleted", "Activated", "Inactivated", "Batch Activated", "Batch Inactivated", "Logged In/Out"
        startDate: undefined,
        endDate: undefined,
    });

    // Options for dropdowns (match with your Action parsing logic in backend)
    // You need to adjust these lists to exactly match what the backend returns
    // and what you want to display/filter.
    const roleOptions = ["all", "Admin", "Staff", "Customer", "No Role"];
    const areaOptions = ["all", "Category", "Question", "Subscription Plan", "User", "Unknown"];
    const actionTypeOptions = [
        "all", "Added", "Updated", "Deleted", "Activated", "Inactivated",
        "Batch Activated", "Batch Inactivated", "Logged In", "Logged Out", "Unknown"
    ];

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Send filters directly to backend
            const data = await auditLogService.getFilteredAuditLogs(filters);
            setAuditLogs(data);
            console.log('Fetched audit logs:', data);
        } catch (err: any) {
            console.error("Error fetching audit logs:", err);
            setError(err.message || 'Failed to fetch audit logs. Please ensure the backend is running and accessible.');
            toast.error(err.message || 'Unable to load audit logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []); // Fetch initially

    const handleApplyFilters = () => {
        fetchAuditLogs(); // Re-fetch data with current filters
    };

    const handleClearFilters = () => {
        setFilters({
            userName: '',
            userRole: 'all',
            area: 'all',
            actionType: 'all',
            startDate: undefined,
            endDate: undefined,
        });
        // Call fetch again after state is updated
        // (useEffect with empty dependency array won't run again when filters change.
        // You can add filters to dependency array or call fetchAuditLogs directly here)
        // Currently, I've added `handleApplyFilters` for Apply button, and `handleClearFilters`
        // will call `fetchAuditLogs` after resetting filters.
        fetchAuditLogs(); 
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading audit logs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-semibold">Error loading audit logs</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <div className="space-x-2">
                        <Button onClick={fetchAuditLogs}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try again
                        </Button>
                        <Link to="/admin/dashboard">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Log Management</h1>
                    <p className="text-gray-600">Review user and system activities.</p>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={fetchAuditLogs}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Link to="/admin/dashboard">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="userName">Username</Label>
                                <Input
                                    id="userName"
                                    placeholder="Search by username"
                                    value={filters.userName}
                                    onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="userRole">Role</Label>
                                <Select
                                    value={filters.userRole}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value }))}
                                >
                                    <SelectTrigger id="userRole">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="area">Area</Label>
                                <Select
                                    value={filters.area}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, area: value }))}
                                >
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="All Areas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areaOptions.map(area => (
                                            <SelectItem key={area} value={area}>{area}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="actionType">Action Type</Label>
                                <Select
                                    value={filters.actionType}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
                                >
                                    <SelectTrigger id="actionType">
                                        <SelectValue placeholder="All Actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {actionTypeOptions.map(action => (
                                            <SelectItem key={action} value={action}>{action}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Date Range Filters */}
                            <div>
                                <Label htmlFor="startDate">From Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.startDate ? format(new Date(filters.startDate), "PPP") : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.startDate ? new Date(filters.startDate) : undefined}
                                            onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date ? format(date, "yyyy-MM-dd") : undefined }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="endDate">To Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.endDate ? format(new Date(filters.endDate), "PPP") : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.endDate ? new Date(filters.endDate) : undefined}
                                            onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date ? format(date, "yyyy-MM-dd") : undefined }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
                            <Button onClick={handleApplyFilters}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs</CardTitle>
                        <CardDescription>Actions recorded in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="w-full text-sm text-left text-gray-500">
                                <TableHeader className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <TableRow>
                                       
                                        <TableHead className="px-4 py-3 w-36 min-w-36">Date & Time</TableHead>
                                        <TableHead className="px-4 py-3 w-32">User</TableHead>
                                        <TableHead className="px-4 py-3 w-24">Role</TableHead>
                                        <TableHead className="px-4 py-3 w-28">Area</TableHead>
                                        <TableHead className="px-4 py-3 w-28">Action</TableHead>
                                        <TableHead className="px-4 py-3">Description</TableHead>
                                        
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No logs found matching the filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                
                                                <TableCell className="px-4 py-3 whitespace-nowrap text-xs">{log.createdAt}</TableCell>
                                                <TableCell className="px-4 py-3">{log.userName || log.userId || 'N/A'}</TableCell>
                                                <TableCell className="px-4 py-3">{log.userRole || 'N/A'}</TableCell>
                                                <TableCell className="px-4 py-3">{log.area}</TableCell>
                                                <TableCell className="px-4 py-3">{log.actionType}</TableCell>
                                                <TableCell className="px-4 py-3 break-words">{log.actionDescription}</TableCell>
                                                
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AuditLogManagementPage;