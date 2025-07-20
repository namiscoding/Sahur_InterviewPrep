import React, { useEffect, useState, useCallback } from 'react';
import {
  getCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  updateCustomerSubscription,
  PagedResult,
  UserDTO,
  UserDetailDTO,
  UpdateUserStatusDTO,
  UpdateSubscriptionDTO,
} from '../../services/customerService';
import { useNavigate } from 'react-router-dom'
// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { ArrowLeft, Search, Filter, Eye, AlertCircle } from "lucide-react";
const CustomerManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<PagedResult<UserDTO>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<UserDetailDTO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newSubscriptionLevel, setNewSubscriptionLevel] = useState("");
  const [reason, setReason] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(
        searchTerm,
        selectedStatus === "all" ? "" : selectedStatus,
        customers.page,
        customers.pageSize
      );
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError('Failed to fetch customers. Please ensure the backend is running and accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, selectedStatus, customers.page]);

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getCustomerDetails(id);
      setSelectedCustomer(details);
      setNewStatus(details.status);
      setNewSubscriptionLevel(details.subscriptionLevel);
      setIsDetailsOpen(true);
    } catch (err) {
      setError('Failed to fetch customer details.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCustomer) return;
    setUpdateError(null);
  
    try {
      const dto: UpdateUserStatusDTO = { status: newStatus };
      const updated = await updateCustomerStatus(selectedCustomer.id, dto);
      setSelectedCustomer({ ...selectedCustomer, status: updated.status });
  
      toast({
        title: "Success",
        description: "Customer status updated successfully.",
        duration: 2000,
      });
  
      // Delay 1.5s để toast hiển thị rõ rồi mới đóng dialog và reload
      setTimeout(() => {
        setIsDetailsOpen(false);
        fetchCustomers(); // Làm mới danh sách sau khi cập nhật
      }, 1000);
  
    } catch (error) {
      setUpdateError("Failed to update status.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer status.",
        duration: 2000,
      });
    }
  };
  

  const calculateDefaultExpiry = useCallback((baseDate: Date = new Date('2025-07-14')) => {
    const expiry = new Date(baseDate);
    expiry.setMonth(expiry.getMonth() + 1);
    return expiry.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;

    if (newSubscriptionLevel === 'Free') {
      setReason('');
    } else if (newSubscriptionLevel === 'Premium') {
      if (selectedCustomer.subscriptionLevel !== 'Premium') {
        // From Free to Premium: +1 month from now
        setReason('');
      } else {
        // From Premium to Premium: +1 month from current expiry
        setReason('');
      }
    }
  }, [newSubscriptionLevel, selectedCustomer, calculateDefaultExpiry]);

  const handleUpdateSubscription = async () => {
    if (!selectedCustomer || !reason.trim()) {
      setUpdateError('Reason is required for subscription changes.');
      return;
    }
    setUpdateError(null);
    try {
      const dto: UpdateSubscriptionDTO = {
        subscriptionLevel: newSubscriptionLevel,
        reason,
      };
      const updated = await updateCustomerSubscription(selectedCustomer.id, dto);
      setSelectedCustomer({ ...selectedCustomer, ...updated });
      fetchCustomers();
      setReason("");
      toast({
        title: "Success",
        description: "Customer subscription updated successfully.",
      });
    } catch (err) {
      setUpdateError('Failed to update subscription.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer subscription.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return "bg-green-100 text-green-800";
      case 'inactive': return "bg-yellow-100 text-yellow-800";
      case 'suspended': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'premium': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearch);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
          <Button onClick={fetchCustomers}>
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
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="mt-2 text-gray-600">UserAdmin manage customer accounts in InterviewPrep system</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}> 
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name or email..."
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm font-medium text-gray-700">Total Accounts: {customers.totalCount}</span>
          </div>
        </div>

        {/* Customer Table */}
        {customers.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedStatus !== "all" ? "No customers match your filters" : "No customers found"}
              </p>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "There are no customer accounts yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Subscription</TableHead>
                    <TableHead className="font-semibold text-gray-900">Expiry Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.items.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">{customer.displayName}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(customer.status)} px-2 py-1 text-xs font-medium`}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getSubscriptionColor(customer.subscriptionLevel)} px-2 py-1 text-xs font-medium`}>
                          {customer.subscriptionLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {customer.subscriptionExpiryDate 
                            ? new Date(customer.subscriptionExpiryDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(customer.id)}
                          className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            disabled={customers.page === 1}
            onClick={() => setCustomers(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span>Page {customers.page} of {Math.ceil(customers.totalCount / customers.pageSize)}</span>
          <Button 
            variant="outline" 
            disabled={customers.page * customers.pageSize >= customers.totalCount}
            onClick={() => setCustomers(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        {/* Results Summary */}
        {customers.items.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
            <p>
              Showing <span className="font-medium">{customers.items.length}</span> of{" "}
              <span className="font-medium">{customers.totalCount}</span> customers
            </p>
            {(searchTerm || selectedStatus !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setLocalSearch("");
                  setSearchTerm("");
                  setSelectedStatus("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Details Dialog */}
      {selectedCustomer && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Details: {selectedCustomer.displayName}</DialogTitle>
              <DialogDescription>{selectedCustomer.email}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{selectedCustomer.status}</p>
                </div>
                <div>
                  <Label>Subscription Level</Label>
                  <p className="text-sm">{selectedCustomer.subscriptionLevel}</p>
                </div>
                <div>
                  <Label>Subscription Expiry</Label>
                  <p className="text-sm">{selectedCustomer.subscriptionExpiryDate ? new Date(selectedCustomer.subscriptionExpiryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <Tabs defaultValue="transactions" className="mt-4">
                <TabsList>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="mockSessions">Mock Sessions</TabsTrigger>
                  <TabsTrigger value="usageLogs">Usage Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions">
                  <div className="overflow-auto max-h-40">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{tx.id}</TableCell>
                            <TableCell>{tx.amount}</TableCell>
                            <TableCell>{tx.currency}</TableCell>
                            <TableCell>{tx.status}</TableCell>
                            <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="mockSessions">
                  <div className="overflow-auto max-h-40">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.mockSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{session.id}</TableCell>
                            <TableCell>{session.sessionType}</TableCell>
                            <TableCell>{session.status}</TableCell>
                            <TableCell>{new Date(session.startedAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="usageLogs">
                  <div className="overflow-auto max-h-40">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Action Type</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.usageLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.actionType}</TableCell>
                            <TableCell>{new Date(log.usageTimestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="mt-2" onClick={handleUpdateStatus}>Update Status</Button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Update Subscription</h3>
                <Select value={newSubscriptionLevel} onValueChange={setNewSubscriptionLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2"
                  placeholder="Reason for update (required)"
                />
                <Button className="mt-2" onClick={handleUpdateSubscription}>Update Subscription</Button>
              </div>

              {updateError && (
                <div className="flex items-center text-red-600 mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {updateError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerManagementPage;