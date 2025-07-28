"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Import your existing services
import {
  getStaffs,
  getStaffDetails,
  createStaff,
  updateStaffStatus,
  resetStaffPassword,
  type PagedResult,
  type StaffDTO,
  type CreateStaffDTO,
  type UpdateStaffStatusDTO,
} from "../../services/staffService"

// Shadcn UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Icons
import { ArrowLeft, Search, Filter, Eye, AlertCircle, PlusCircle } from "lucide-react"

const StaffManagementPage: React.FC = () => {
  const navigate = useNavigate()
  // All your existing state variables remain unchanged
  const [staffs, setStaffs] = useState<PagedResult<StaffDTO>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [localSearch, setLocalSearch] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<StaffDTO | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState("")
  const [newEmail, setNewEmail] = useState("")

  const [resetLoading, setResetLoading] = useState(false)

  // All your existing functions remain unchanged
  const fetchStaffs = async () => {
    setLoading(true)
    try {
      const data = await getStaffs(
        searchTerm,
        selectedStatus === "all" ? "" : selectedStatus,
        staffs.page,
        staffs.pageSize,
      )
      setStaffs(data)
    } catch (err) {
      console.error("Error fetching staffs:", err)
      setError("Failed to fetch staffs. Please ensure the backend is running and accessible.")
      toast.error("Failed to fetch staffs. Please ensure the backend is running and accessible.");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffs()
  }, [searchTerm, selectedStatus, staffs.page])

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getStaffDetails(id)
      setSelectedStaff(details)
      setNewStatus(details.status)
      setIsDetailsOpen(true)
    } catch (err) {
      setError("Failed to fetch staff details.")
      toast.error("Failed to fetch staff details.");
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedStaff) return
    setUpdateError(null)
    try {
      const dto: UpdateStaffStatusDTO = { status: newStatus }
      const updated = await updateStaffStatus(selectedStaff.id, dto)
      setSelectedStaff({ ...selectedStaff, status: updated.status })
      fetchStaffs()
      toast.success("Staff status updated successfully.");
      setIsDetailsOpen(false);
    } catch (err) {
      setUpdateError("Failed to update status.")
      toast.error("Failed to update staff status.");
    }
  }

  const handleResetPassword = async () => {
    if (!selectedStaff) return
    setResetLoading(true)
    try {
      await resetStaffPassword(selectedStaff.id)
      toast.success("Password reset successful.");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Unknown error occurred while resetting password."
      console.error("Reset password failed:", err)
      toast.error(`Password reset failed: ${message}`);
    } finally {
      setResetLoading(false)
    }
  }

  const handleCreateStaff = async () => {
    // Validation
    if (!newDisplayName.trim()) {
      toast.error("Please enter display name.");
      return;
    }
    
    if (!newEmail.trim()) {
      toast.error("Please enter email address.");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Invalid email format.");
      return;
    }
    
    try {
      const dto: CreateStaffDTO = {
        displayName: newDisplayName.trim(),
        email: newEmail.trim().toLowerCase(),
      }
      await createStaff(dto)
      setIsCreateOpen(false)
      setNewDisplayName("")
      setNewEmail("")
      fetchStaffs()
      toast.success(`Staff "${newDisplayName}" created successfully! Temporary password sent via email.`);
    } catch (err: any) {
      console.error("Create staff error:", err);
      
      // Extract error message and code from response
      const response = err?.response?.data;
      const errorCode = response?.errorCode;
      let message = "Failed to create staff.";
      
      if (response?.message) {
        message = response.message;
      } else if (err?.response?.data) {
        message = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err?.message) {
        message = err.message;
      }
      
      // Handle specific error codes - only show toast, no form error
      if (errorCode === "EmailAlreadyExists") {
        toast.error("Email already exists! Please use a different email address.");
      } else {
        toast.error(`Failed to create staff: ${message}`);
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(localSearch)
      if (localSearch.trim()) {
        toast.success(`Searching for: "${localSearch}"`);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staffs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          <Button onClick={fetchStaffs}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="mt-2 text-gray-600">Manage staff accounts and permissions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Staff
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
              placeholder="Search staffs by name or email..."
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

            <span className="text-sm font-medium text-gray-700">Total Accounts: {staffs.totalCount}</span>
          </div>
        </div>

        {/* Staff Table */}
        <Card className="shadow-sm">
          <CardContent>
            {staffs.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">No staffs found</p>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffs.items.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.displayName}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(staff.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button
            variant="outline"
            disabled={staffs.page === 1}
            onClick={() => setStaffs((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span>
            Page {staffs.page} of {Math.ceil(staffs.totalCount / staffs.pageSize)}
          </span>
          <Button
            variant="outline"
            disabled={staffs.page * staffs.pageSize >= staffs.totalCount}
            onClick={() => setStaffs((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        {/* Results Summary */}
        {staffs.items.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
            <p>
              Showing <span className="font-medium">{staffs.items.length}</span> of{" "}
              <span className="font-medium">{staffs.totalCount}</span> staffs
            </p>
            {(searchTerm || selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearch("")
                  setSearchTerm("")
                  setSelectedStatus("all")
                  toast.success("All search filters have been cleared.");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Details Dialog - Your existing code */}
        {selectedStaff && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Staff Details: {selectedStaff.displayName}</DialogTitle>
                <DialogDescription>{selectedStaff.email}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm">{selectedStaff.status}</p>
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
                  <Button className="mt-2" onClick={handleUpdateStatus}>
                    Update Status
                  </Button>
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
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Staff</DialogTitle>
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
                  placeholder="Enter display name..."
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter email address..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewDisplayName("");
                  setNewEmail("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateStaff}>Create Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default StaffManagementPage