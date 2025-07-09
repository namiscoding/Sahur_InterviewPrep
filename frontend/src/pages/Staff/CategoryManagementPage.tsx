"use client" // Thêm dòng này nếu bạn đang dùng Next.js App Router

import React, { useEffect, useState } from 'react';
import { getCategories, Category } from '../../services/categoryService'; // Đảm bảo đường dẫn đúng

// Nhập các Shadcn UI components và icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Input, Badge, Select không thực sự cần cho giao diện CategoryManagement (UCSTF002.2)
// Nếu bạn muốn thêm tính năng search/filter cho category, sẽ cần thêm Input và Select.
import { Badge } from "@/components/ui/badge"; // Dùng cho trạng thái Active/Inactive

import { PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react"; // Các icon mới: Thêm, Sửa, Xóa, Quay lại
import { Input } from "@/components/ui/input"; // Có thể dùng cho search nếu mở rộng
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Có thể dùng cho filter nếu mở rộng

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        // Log lỗi chi tiết hơn để dễ debug
        console.error("Error fetching categories in CategoryManagementPage:", err);
        setError('Failed to fetch categories. Please ensure the backend is running and accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hàm tạo màu cho Badge trạng thái (có thể tái sử dụng)
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
        <p className="text-lg font-semibold mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
              <p className="mt-2 text-gray-600">View, create, edit, and delete question categories.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {/* TODO: Implement navigation back to dashboard/previous page */}}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => {/* TODO: Implement create new category */}}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Category
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters (Optional for future expansion) */}
        {/* Bạn có thể thêm phần search/filter vào đây nếu muốn lọc danh sách category */}
        {/* Ví dụ:
        <div className="mb-6">
            <div className="relative">
                <Input
                    placeholder="Search categories by name..."
                    className="pl-10"
                    onChange={(e) => console.log(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
        </div>
        */}

        {/* Category List Cards (Using Card components for each category) */}
        {categories.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            <p className="text-lg">No categories found in the system yet.</p>
            <p className="text-sm mt-2">Click "New Category" to add one.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                         <CardDescription className="mt-2 text-sm">{category.description}</CardDescription>
                      )}
                    </div>
                    <Badge className={getStatusColor(category.isActive)}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => {/* TODO: Implement edit functionality */}}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {/* TODO: Implement delete functionality */}}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination (Optional for future expansion if many categories) */}
        {/* Có thể thêm phần Pagination nếu số lượng Category lớn */}
        {/*
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{categories.length}</span> of{" "}
            <span className="font-medium">{categories.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled> // Disable for now as there's no pagination logic
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        */}
      </main>
    </div>
  );
};

export default CategoryManagementPage;