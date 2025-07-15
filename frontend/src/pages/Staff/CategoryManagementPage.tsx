"use client"

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import { getStaffCategories, createCategory, Category, CreateCategoryDTO } from '../../services/categoryService'; // Import createCategory và CreateCategoryDTO

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "sonner"; // Removed - not installed, use react-hot-toast if needed

// Component Form mới
import CategoryForm from '@/components/CategoryForm'; // Adjust path if necessary

// Icons
import { PlusCircle, Edit, Trash2, ArrowLeft, Search, Filter, RefreshCw } from "lucide-react";

const CategoryManagementPage: React.FC = () => {
  const navigate = useNavigate(); // Khởi tạo hook

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State mới cho chức năng thêm/sửa
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  // const [editingCategory, setEditingCategory] = useState<Category | null>(null); // Dành cho chức năng chỉnh sửa

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffCategories();
      setCategories(data);
      console.log('Fetched categories:', data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('Failed to fetch categories. Please ensure the backend is running and accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search and status
  useEffect(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(category =>
        selectedStatus === "active" ? category.isActive : !category.isActive
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, selectedStatus]);

  const handleDeleteCategory = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${name}"?\n\nThis action cannot be undone and may affect related questions.`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);
      setErrorMessage(null);
      // await deleteCategory(id); // Uncomment this line when you have deleteCategory in service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call for delete

      // Remove from state
      setCategories(prev => prev.filter(cat => cat.id !== id));

      setSuccessMessage(`Category "${name}" deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage('Failed to delete category. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateNewCategory = async (newCategory: CreateCategoryDTO) => {
    setIsSubmittingForm(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const createdCategory = await createCategory(newCategory);
      setCategories(prev => [...prev, createdCategory]); // Thêm danh mục mới vào danh sách
      setSuccessMessage(`Category "${createdCategory.name}" created successfully!`);
      setShowCreateForm(false); // Đóng form sau khi tạo thành công
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) { // Thêm : any để xử lý lỗi tốt hơn
      console.error('Error creating category:', error);
      setErrorMessage(error.message || 'Failed to create category. Please check your input.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleRefresh = () => {
    fetchCategories();
    clearFilters(); // Xóa bộ lọc khi làm mới
    setShowCreateForm(false); // Đảm bảo form đóng khi làm mới
    // setEditingCategory(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error Loading Categories</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="mt-2 text-gray-600">
                Manage question categories for your interview system
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total categories: {categories.length}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              {/* Sử dụng navigate thay vì Link to "/" */}
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => setShowCreateForm(true)}> {/* Kích hoạt hiển thị form */}
                <PlusCircle className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Category Form - Hiển thị khi showCreateForm là true */}
        {showCreateForm && (
          <div className="mb-6 max-w-lg mx-auto"> {/* Tùy chỉnh chiều rộng và căn giữa nếu muốn */}
            <CategoryForm
              onSave={handleCreateNewCategory}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={isSubmittingForm}
              // initialData={editingCategory} // Dành cho chức năng chỉnh sửa
            />
          </div>
        )}

        {/* Search and Filters */}
        {!showCreateForm && ( // Ẩn tìm kiếm/lọc khi form đang hiển thị
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedStatus !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Category Cards */}
        {!showCreateForm && ( // Ẩn danh sách khi form đang hiển thị
          filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedStatus !== "all" ? "No categories match your filters" : "No categories found"}
                </p>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first category"}
                </p>
                {!searchTerm && selectedStatus === "all" && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription className="mt-2">
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge className={getStatusColor(category.isActive)}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* TODO: Implement edit functionality */ }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive" // Sử dụng variant destructive cho nút xóa
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        disabled={deleteLoading === category.id}
                      >
                        {deleteLoading === category.id ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}


        {/* Results Summary */}
        {filteredCategories.length > 0 && !showCreateForm && (
          <div className="flex items-center justify-between text-sm text-gray-700 bg-white p-4 rounded-lg border">
            <div>
              <p>
                Showing <span className="font-medium">{filteredCategories.length}</span> of{" "}
                <span className="font-medium">{categories.length}</span> categories
              </p>
              {(searchTerm || selectedStatus !== "all") && (
                <p className="text-xs text-gray-500 mt-1">
                  {searchTerm && `Search: "${searchTerm}"`}
                  {searchTerm && selectedStatus !== "all" && " | "}
                  {selectedStatus !== "all" && `Status: ${selectedStatus}`}
                </p>
              )}
            </div>
            {(searchTerm || selectedStatus !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagementPage;