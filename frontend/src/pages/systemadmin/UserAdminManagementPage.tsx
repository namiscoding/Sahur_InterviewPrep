// File: src/pages/systemadmin/UserAdminManagementPage.tsx
import React, { useEffect, useState } from 'react';
import {
  getUserAdmins,
  getUserAdminDetails,
  createUserAdmin,
  updateUserAdminStatus,
  resetUserAdminPassword,
  PagedResult,
  UserAdminDTO,
  CreateUserAdminDTO,
  UpdateUserAdminStatusDTO,
} from '../../services/userAdminService';

// Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Icons
import { ArrowLeft, Search, Filter, Eye, AlertCircle, PlusCircle, MoreHorizontal } from "lucide-react";

const UserAdminManagementPage: React.FC = () => {
  // Khởi tạo useNavigate hook
  const navigate = useNavigate();

  const [userAdmins, setUserAdmins] = useState<PagedResult<UserAdminDTO>>({
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
  const [selectedUserAdmin, setSelectedUserAdmin] = useState<UserAdminDTO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserAdmins = async () => {
    setLoading(true);
    try {
      const data = await getUserAdmins(
        searchTerm,
        selectedStatus === "all" ? "" : selectedStatus,
        userAdmins.page,
        userAdmins.pageSize
      );
      setUserAdmins(data);
    } catch (err) {
      console.error("Error fetching user admins:", err);
      setError('Failed to fetch user admins. Please ensure the backend is running and accessible.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user admins. Please ensure the backend is running and accessible.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAdmins();
  }, [searchTerm, selectedStatus, userAdmins.page]);

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getUserAdminDetails(id);
      setSelectedUserAdmin(details);
      setNewStatus(details.status);
      setIsDetailsOpen(true);
    } catch (err) {
      setError('Failed to fetch user admin details.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user admin details.",
        duration: 3000,
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUserAdmin) return;
    setUpdateError(null);
    try {
      const dto: UpdateUserAdminStatusDTO = { status: newStatus };
      const updated = await updateUserAdminStatus(selectedUserAdmin.id, dto);
      setSelectedUserAdmin({ ...selectedUserAdmin, status: updated.status });
  
      toast({
        title: "Success",
        description: "User admin status updated successfully.",
        duration: 2000,
      });
  
        setIsDetailsOpen(false);
        fetchUserAdmins();
    } catch (err) {
      setUpdateError('Failed to update status.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user admin status.",
        duration: 2000,
      });
    }
  };
  

  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!selectedUserAdmin) return;

    setResetLoading(true);
    try {
      const tempPassword = await resetUserAdminPassword(selectedUserAdmin.id);
      toast({
        title: "Password Reset Successful",
        description: `Temporary password: ${tempPassword}`,
        duration: 6000,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error occurred while resetting password.";
      console.error("Reset password failed:", err);

      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: message,
        duration: 4000,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleCreateUserAdmin = async () => {
    setCreateError(null);
    try {
      const dto: CreateUserAdminDTO = {
        displayName: newDisplayName,
        email: newEmail
      };
      await createUserAdmin(dto);
      setIsCreateOpen(false);
      setNewDisplayName("");
      setNewEmail("");
      fetchUserAdmins();
      toast({
        title: "Success",
        description: "User admin created and temporary password sent via email.",
        duration: 4000,
      });
    } catch (err: any) {
      const response = err?.response?.data;
      const code = response?.errorCode;
      const message = response?.message || "Failed to create user admin.";
      
      if (code === "EmailAlreadyExists") {
        setCreateError("This email is already associated with another account.");
        toast({
          variant: "destructive",
          title: "Duplicate Email",
          description: "This email is already in use. Please try a different one.",
        });
      } else {
        setCreateError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    }
  };  

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'inactive': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearch);
      if (localSearch.trim()) {
        toast({
          title: "Search Applied",
          description: `Searching for: "${localSearch}"`,
          duration: 2000,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user admins...</p>
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
          <Button onClick={fetchUserAdmins}>
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
              <h1 className="text-3xl font-bold text-gray-900">User Admin Management</h1>
              <p className="mt-2 text-gray-600">SystemAdmin manage user admin accounts in InterviewPrep system</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User Admin
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
              placeholder="Search user admins by name or email..."
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
              </SelectContent>
            </Select>

            <span className="text-sm font-medium text-gray-700">Total Accounts: {userAdmins.totalCount}</span>
          </div>
        </div>

        {/* User Admin Table */}
        <Card className="shadow-sm">
          <CardContent>
            {userAdmins.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedStatus !== "all" ? "No user admins match your filters" : "No user admins found"}
                </p>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "There are no user admin accounts yet"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Display Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Email</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAdmins.items.map((userAdmin) => (
                      <TableRow key={userAdmin.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {userAdmin.displayName}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {userAdmin.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(userAdmin.status)} border`}>
                            {userAdmin.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(userAdmin.id)}
                            className="hover:bg-blue-50 hover:border-blue-200"
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
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={userAdmins.page === 1}
            onClick={() => setUserAdmins(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {userAdmins.page} of {Math.ceil(userAdmins.totalCount / userAdmins.pageSize)}
          </span>
          <Button
            variant="outline"
            disabled={userAdmins.page * userAdmins.pageSize >= userAdmins.totalCount}
            onClick={() => setUserAdmins(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        {/* Results Summary */}
        {userAdmins.items.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
            <p>
              Showing <span className="font-medium">{userAdmins.items.length}</span> of{" "}
              <span className="font-medium">{userAdmins.totalCount}</span> user admins
            </p>
            {(searchTerm || selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearch("");
                  setSearchTerm("");
                  setSelectedStatus("all");
                  toast({
                    title: "Filters Cleared",
                    description: "All search filters have been cleared.",
                    duration: 2000,
                  });
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Details Dialog */}
      {selectedUserAdmin && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Admin Details: {selectedUserAdmin.displayName}</DialogTitle>
              <DialogDescription>{selectedUserAdmin.email}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Status</Label>
                <p className="text-sm">{selectedUserAdmin.status}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="mt-2" onClick={handleUpdateStatus}>Update Status</Button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Reset Password</h3>
                <Button variant="destructive" onClick={handleResetPassword} disabled={resetLoading}>
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User Admin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          {createError && (
            <div className="flex items-center text-red-600 mt-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              {createError}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleCreateUserAdmin}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAdminManagementPage;