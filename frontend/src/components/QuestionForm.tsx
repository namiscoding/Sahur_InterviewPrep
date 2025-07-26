import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateQuestionDTO, Question, getDifficultyLevelText } from '../services/questionService';
import { getStaffCategories, Category } from '../services/categoryService';
import { PlusCircle, Save, XCircle, RefreshCw, X } from "lucide-react";

interface QuestionFormProps {
  onSave: (question: CreateQuestionDTO) => void;
  onCancel: () => void;
  initialData?: Question;
  isSubmitting: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSave, onCancel, initialData, isSubmitting }) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [sampleAnswer, setSampleAnswer] = useState(initialData?.sampleAnswer || '');
  const [difficultyLevel, setDifficultyLevel] = useState(initialData?.difficultyLevel?.toString() || '1');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialData?.categories?.map(c => c.id) || []
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    initialData?.tags?.map(t => t.slug) || []
  );
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getStaffCategories();
        setCategories(data.filter(c => c.isActive)); // Only show active categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionData: CreateQuestionDTO = {
      content,
      sampleAnswer: sampleAnswer || undefined,
      difficultyLevel: parseInt(difficultyLevel),
      isActive,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      tagNames: tags.length > 0 ? tags : undefined,
    };
    onSave(questionData);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setSampleAnswer(initialData.sampleAnswer || '');
      setDifficultyLevel(initialData.difficultyLevel.toString());
      setIsActive(initialData.isActive);
      // Ensure initialData.categories is an array before mapping
      setSelectedCategoryIds(initialData.categories?.map(c => c.id) || []);
      setTags(initialData.tags?.map(t => t.slug) || []);
    } else {
      // Reset form when no initialData (i.e., creating new)
      setContent('');
      setSampleAnswer('');
      setDifficultyLevel('1');
      setIsActive(true);
      setSelectedCategoryIds([]);
      setTags([]);
    }
  }, [initialData]);

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Edit Question' : 'Create New Question'}
      </h3>

      {/* Content */}
      <div>
        <Label htmlFor="content">Question Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter interview question content..."
          className="mt-1"
          rows={4}
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Sample Answer */}
      <div>
        <Label htmlFor="sampleAnswer">Sample Answer (optional)</Label>
        <Textarea
          id="sampleAnswer"
          value={sampleAnswer}
          onChange={(e) => setSampleAnswer(e.target.value)}
          placeholder="Enter a sample answer for the question..."
          className="mt-1"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Difficulty Level */}
      <div>
        <Label htmlFor="difficulty">Difficulty Level *</Label>
        <Select value={difficultyLevel} onValueChange={setDifficultyLevel} disabled={isSubmitting}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Easy</SelectItem>
            <SelectItem value="1">Medium</SelectItem>
            <SelectItem value="2">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div>
        <Label>Categories (optional)</Label>
        {categoriesLoading ? (
          <div className="mt-2 text-sm text-gray-500">Loading categories...</div>
        ) : (
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No categories available</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    disabled={isSubmitting}
                    className="rounded border-gray-300"
                  />
                  <Label 
                    htmlFor={`category-${category.id}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        )}
        {selectedCategoryIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCategoryIds.map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags (optional)</Label>
        <div className="mt-1 space-y-2">
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Enter tag and press Enter to add..."
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || isSubmitting}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs"> {/* Changed key to 'tag' */} 
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSubmitting}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Status - Only show for create mode */}
      {!isEditMode && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isSubmitting}
          />
          <Label htmlFor="isActive">Activate Question</Label>
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
            Use the switch in the question list to change status.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Update Question' : 'Create Question'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;