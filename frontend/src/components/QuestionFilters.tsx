import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

import { getPublicCategories, CategoryForCustomer } from '../services/categoryService';
import { getAllTags, Tag } from '../services/tagService';

interface QuestionFiltersProps {
  onFilterChange: (filters: { search?: string; categoryId?: number; difficultyLevel?: string }) => void;
}
const QuestionFilters: React.FC<QuestionFiltersProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All'); // State mới

  const [categories, setCategories] = useState<CategoryForCustomer[]>([]);

  useEffect(() => {
    // Tải danh sách categories và tags cho dropdown
    const loadFilters = async () => {
      try {
        setCategories(await getPublicCategories());
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };
    loadFilters();
  }, []);

  const handleApplyFilters = () => {
    onFilterChange({
      search: searchTerm || undefined,
      categoryId: (selectedCategoryId && selectedCategoryId !== 'All') ? parseInt(selectedCategoryId) : undefined,
      difficultyLevel: (selectedDifficulty && selectedDifficulty !== 'All') ? selectedDifficulty : undefined,
    });
  };

 const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId('');
    setSelectedDifficulty(''); // Reset difficulty
    onFilterChange({});
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả danh mục</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả độ khó</SelectItem>
            <SelectItem value="Easy">Dễ</SelectItem>
            <SelectItem value="Medium">Trung bình</SelectItem>
            <SelectItem value="Hard">Khó</SelectItem>
          </SelectContent>
        </Select>   
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" /> Xóa bộ lọc
        </Button>
        <Button onClick={handleApplyFilters}>
            <Filter className="mr-2 h-4 w-4" /> Áp dụng
        </Button>
      </div>
    </div>
  );
};

export default QuestionFilters;