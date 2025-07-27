// File: src/pages/systemadmin/SystemAdminTransactionsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  getAllTransactions,
  getTransactionDetails,
  getTransactionStatistics,
  PagedResult,
  TransactionListDTO,
  TransactionDetailDTO,
  TransactionFilterDTO,
  TransactionStatisticsDTO,
} from '../../services/transactionAdminService';

// Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';

// Shadcn UI components
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { toast } from 'react-hot-toast';
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { CalendarIcon, Search, Filter, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import { cn, formatCurrency } from "../../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Icons
import { ArrowLeft } from "lucide-react";

const SystemAdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<PagedResult<TransactionListDTO>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailDTO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statistics, setStatistics] = useState<TransactionStatisticsDTO | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const filter: TransactionFilterDTO = {
      search: searchTerm,
      customerSearch: customerSearch,
      status: selectedStatus === "all" ? "" : selectedStatus,
      fromDate: fromDate ? fromDate.toISOString() : undefined,
      toDate: toDate ? toDate.toISOString() : undefined,
      page: transactions.page,
      pageSize: transactions.pageSize,
    };
    try {
      const [data, stats] = await Promise.all([
        getAllTransactions(filter),
        getTransactionStatistics(filter)
      ]);
      setTransactions(data);
      setStatistics(stats);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError('Failed to fetch transactions. Please ensure the backend is running and accessible.');
      toast.error("Failed to fetch transactions. Please ensure the backend is running and accessible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, customerSearch, selectedStatus, fromDate, toDate, transactions.page]);

  const handleViewDetails = async (id: number) => {
    try {
      const details = await getTransactionDetails(id);
      setSelectedTransaction(details);
      setIsDetailsOpen(true);
    } catch (err) {
      setError('Failed to fetch transaction details.');
      toast.error("Failed to fetch transaction details.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return "bg-green-100 text-green-800";
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'failed': return "bg-red-100 text-red-800";
      case 'cancelled': return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearch);
      if (localSearch.trim()) {
              toast.success(`Searching for: "${localSearch}"`);
      }
    }
  };

  const safeFormatDate = (dateString: string | null | undefined, formatString: string = "PPP"): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button onClick={fetchTransactions}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Transactions Management</h1>
              <p className="mt-2 text-gray-600">SystemAdmin view customer transactions in InterviewPrep system</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/systemadmin/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Revenue Statistics */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{statistics?.totalTransactions || 0}</div>
                <p className="text-xs text-gray-500 mt-1">All time transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statistics?.completedTransactions || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics?.successRate ? `${statistics.successRate.toFixed(1)}% success rate` : 'No transactions'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statistics?.completedRevenue || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">From completed transactions</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue by Currency */}
          {statistics?.revenueByCurrency && statistics.revenueByCurrency.length > 0 && (
            <div className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenue by Currency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {statistics.revenueByCurrency.map((item) => (
                      <Badge key={item.currency} variant="secondary" className="text-sm">
                        {item.currency}: {formatCurrency(item.totalAmount, item.currency)} ({item.transactionCount} txns)
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions by code or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <Input
              placeholder="Search customer by name or email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-64"
            />

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-between",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  {fromDate ? format(fromDate, "PPP") : <span>From Date</span>}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-between",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  {toDate ? format(toDate, "PPP") : <span>To Date</span>}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          {transactions.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </p>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.transactionCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.customerDisplayName}</div>
                        <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>{transaction.subscriptionPlanName}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{safeFormatDate(transaction.transactionDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(transaction.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={transactions.page === 1}
            onClick={() => setTransactions(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span>Page {transactions.page} of {Math.ceil(transactions.totalCount / transactions.pageSize)}</span>
          <Button
            variant="outline"
            disabled={transactions.page * transactions.pageSize >= transactions.totalCount}
            onClick={() => setTransactions(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        {/* Results Summary */}
        {transactions.items.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
            <div className="flex flex-col gap-1">
              <p>
                Showing <span className="font-medium">{transactions.items.length}</span> of{" "}
                <span className="font-medium">{transactions.totalCount}</span> transactions
              </p>
              <p className="text-xs text-gray-500">
                Total revenue: <span className="font-medium text-green-600">
                  {formatCurrency(statistics?.completedRevenue || 0)}
                </span> (completed transactions only)
              </p>
            </div>
            {(searchTerm || customerSearch || selectedStatus !== "all" || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearch("");
                  setSearchTerm("");
                  setCustomerSearch("");
                  setSelectedStatus("all");
                  setFromDate(undefined);
                  setToDate(undefined);
                            toast.success("All search filters have been cleared.");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Details Dialog */}
      {selectedTransaction && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details: {selectedTransaction.transactionCode}</DialogTitle>
              <DialogDescription>Customer: {selectedTransaction.customerDisplayName} ({selectedTransaction.customerEmail})</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Status</Label>
                <p className="text-sm">{selectedTransaction.status}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p>
              </div>
              <div>
                <Label>Subscription Plan</Label>
                <p className="text-sm">{selectedTransaction.subscriptionPlanName}</p>
              </div>
              <div>
                <Label>Transaction Date</Label>
                <p className="text-sm">{safeFormatDate(selectedTransaction.transactionDate, "PPP HH:mm:ss")}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="text-sm">{selectedTransaction.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <Label>Gateway Transaction ID</Label>
                <p className="text-sm">{selectedTransaction.gatewayTransactionId || 'N/A'}</p>
              </div>
              <div>
                <Label>External Transaction ID</Label>
                <p className="text-sm">{selectedTransaction.externalTransactionId || 'N/A'}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p className="text-sm">{safeFormatDate(selectedTransaction.createdAt, "PPP HH:mm:ss")}</p>
              </div>
              <div>
                <Label>Updated At</Label>
                <p className="text-sm">{safeFormatDate(selectedTransaction.updatedAt, "PPP HH:mm:ss")}</p>
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-between items-center w-full">
                <div className="text-xs text-gray-500">
                  {selectedTransaction.status.toLowerCase() === 'completed' && (
                    <span className="text-green-600 font-medium">
                      Revenue: {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </span>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SystemAdminTransactionsPage;