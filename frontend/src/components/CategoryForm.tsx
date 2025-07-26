import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreateCategoryDTO, Category } from '../services/categoryService';
import { PlusCircle, Save, XCircle, RefreshCw } from "lucide-react";

interface CategoryFormProps {
  onSave: (category: CreateCategoryDTO) => void;
  onCancel: () => void;
  initialData?: Category; // Dùng cho trường hợp chỉnh sửa
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSave, onCancel, initialData, isSubmitting }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true); // Mặc định là true

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData: CreateCategoryDTO = {
      name,
      description: description || undefined, // Gửi undefined nếu mô tả trống
      isActive,
    };
    onSave(categoryData);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else {
      // Reset form khi không có initialData (tức là tạo mới)
      setName('');
      setDescription('');
      setIsActive(true);
    }
  }, [initialData]);

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Category' : 'Create New Category'}
      </h3>

      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Programming, Data Structures"
          required
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the category"
          className="mt-1"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Only show isActive switch for create mode, not edit mode */}
      {!isEditMode && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isSubmitting}
          />
          <Label htmlFor="isActive">Active Category</Label>
        </div>
      )}

      {/* Show current status for edit mode */}
      {isEditMode && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Current Status: <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Use the toggle switch in the category list to change the status.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Category' : 'Create Category'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;

