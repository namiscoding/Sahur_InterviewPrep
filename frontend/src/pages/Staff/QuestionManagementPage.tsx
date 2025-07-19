import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getStaffQuestions, 
  searchQuestions,
  createQuestion, 
  updateQuestionStatus,
  updateQuestionInfo,
  importQuestionsFromExcel,
  Question, 
  CreateQuestionDTO,
  UpdateQuestionStatusDTO,
  UpdateQuestionInfoDTO,
  getDifficultyLevelText,
  getDifficultyLevelColor,
  getQuestionById // Import the new function
} from '../../services/questionService';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Component Form
import QuestionForm from '@/components/QuestionForm';

// Icons
import { 
  PlusCircle, 
  Edit, 
  ArrowLeft, 
  Search, 
  Filter, 
  RefreshCw, 
  Upload,
  FileText,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";

const QuestionManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for add/edit function
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [fetchingEditQuestion, setFetchingEditQuestion] = useState<boolean>(false); // New loading state

  // State for toggle status
  const [statusToggleLoading, setStatusToggleLoading] = useState<number | null>(null);

  // State for Excel import
  const [importLoading, setImportLoading] = useState<boolean>(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffQuestions();
      // Filter out questions with invalid IDs upon fetching
      const validQuestions = data.filter(q => q.id !== undefined && q.id !== null);
      setQuestions(validQuestions);
      console.log('Fetched questions:', validQuestions);
      if (data.length !== validQuestions.length) {
        console.warn('Warning: Some questions with invalid IDs were removed.');
        setErrorMessage('Some questions with invalid IDs were removed from the list.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError('Failed to fetch questions. Please ensure the backend is running and accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions based on search, status, and difficulty
  useEffect(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(question =>
        selectedStatus === "active" ? question.isActive : !question.isActive
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(question =>
        question.difficultyLevel.toString() === selectedDifficulty
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedStatus, selectedDifficulty]);

  const handleCreateNewQuestion = async (newQuestion: CreateQuestionDTO) => {
    setIsSubmittingForm(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const createdQuestion = await createQuestion(newQuestion);
      setQuestions(prev => [...prev, createdQuestion]);
      setSuccessMessage(`Question has been successfully created!`);
      setShowCreateForm(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error creating question:', error);
      setErrorMessage(error.message || 'Failed to create question. Please check the input information.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleUpdateQuestion = async (updatedQuestion: CreateQuestionDTO) => {
    if (!editingQuestion) return;
    
    setIsSubmittingForm(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updateDto: UpdateQuestionInfoDTO = {
        content: updatedQuestion.content,
        sampleAnswer: updatedQuestion.sampleAnswer,
        difficultyLevel: updatedQuestion.difficultyLevel,
        categoryIds: updatedQuestion.categoryIds,
        tagNames: updatedQuestion.tagNames
      };
      
      const updated = await updateQuestionInfo(editingQuestion.id, updateDto);
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
      setSuccessMessage(`Question has been successfully updated!`);
      setEditingQuestion(null);
      setShowCreateForm(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error updating question:', error);
      setErrorMessage(error.message || 'Failed to update the question. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (question: Question) => {
    // Add ID check before calling API
    if (question.id === undefined || question.id === null) {
      console.error('Error: Question ID is undefined. Cannot update status.');
      setErrorMessage('Error: Question ID is undefined. Please try again.');
      return;
    }

    console.log('Attempting to toggle status for question:', question.id);
    console.log('Current status:', question.isActive);
    
    setStatusToggleLoading(question.id);
    setErrorMessage(null);
    
    try {
      const statusDto: UpdateQuestionStatusDTO = {
        isActive: !question.isActive
      };
      
      console.log('Sending status update:', statusDto);
      
      const updatedQuestion = await updateQuestionStatus(question.id, statusDto);
      
      console.log('Received updated question:', updatedQuestion);
      
      setQuestions(prev => prev.map(q => q.id === question.id ? updatedQuestion : q));
      
      const statusText = updatedQuestion.isActive ? 'activated' : 'deactivated';
      setSuccessMessage(`Question has been ${statusText} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error toggling question status:', error);
      console.error('Error details:', error.response?.data); // Add error details
      setErrorMessage(error.message || 'Failed to update question status. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setStatusToggleLoading(null);
    }
  };

  const handleEditQuestion = async (question: Question) => {
    setFetchingEditQuestion(true);
    setErrorMessage(null);
    try {
      // Fetch the full question details including categories and tags
      const fullQuestionDetails = await getQuestionById(question.id);
      setEditingQuestion(fullQuestionDetails);
      setShowCreateForm(true);
    } catch (error: any) {
      console.error('Error fetching question for edit:', error);
      setErrorMessage(error.message || 'Failed to load question details for editing. Please try again.');
    } finally {
      setFetchingEditQuestion(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setShowCreateForm(false);
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setErrorMessage(null);
    try {
      const importedQuestions = await importQuestionsFromExcel(file);
      // Only add questions with valid IDs
      const validImportedQuestions = importedQuestions.filter(q => q.id !== undefined && q.id !== null);
      setQuestions(prev => [...prev, ...validImportedQuestions]);
      setSuccessMessage(`Successfully imported ${validImportedQuestions.length} questions from Excel file!`);
      if (importedQuestions.length !== validImportedQuestions.length) {
        setErrorMessage('Some questions from Excel had invalid IDs and were skipped.');
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error importing Excel:', error);
      setErrorMessage(error.message || 'Failed to import Excel file. Please check the file format.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setImportLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleRefresh = () => {
    fetchQuestions();
    clearFilters();
    setShowCreateForm(false);
    setEditingQuestion(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedDifficulty("all");
  };

  if (loading || fetchingEditQuestion) { // Include fetchingEditQuestion in loading state
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{fetchingEditQuestion ? 'Loading question details...' : 'Loading questions...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error loading questions</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
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
              <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
              <p className="mt-2 text-gray-600">
                Manage interview questions for your system
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Questions: {questions.length}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              
              {/* Import Excel Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleImportExcel}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importLoading}
                />
                <Button variant="outline" disabled={importLoading}>
                  {importLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import Excel
                </Button>
              </div>

              <Button onClick={() => setShowCreateForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Question
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

        {/* Question Form */}
        {showCreateForm && (
          <div className="mb-6 max-w-2xl mx-auto">
            <QuestionForm
              onSave={editingQuestion ? handleUpdateQuestion : handleCreateNewQuestion}
              onCancel={handleCancelEdit}
              isSubmitting={isSubmittingForm}
              initialData={editingQuestion}
            />
          </div>
        )}
        
        {/* Search and Filters */}
        {!showCreateForm && (
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions by content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
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

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Difficulty Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Question Cards */}
        {!showCreateForm && (
          filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="text-gray-400 mb-4">
                  <FileText className="mx-auto h-12 w-12" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all" 
                    ? "No questions found matching the filter" 
                    : "No questions yet"}
                </p>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by creating the first question"}
                </p>
                {!searchTerm && selectedStatus === "all" && selectedDifficulty === "all" && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Question
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mb-8">
              {filteredQuestions.map((question) => (
                // Ensure question.id always exists and is a number
                <Card key={question.id || `temp-${Math.random()}`} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyLevelColor(question.difficultyLevel)}>
                            {getDifficultyLevelText(question.difficultyLevel)}
                          </Badge>
                          <Badge className={getStatusColor(question.isActive)}>
                            {question.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Usage: {question.usageCount} times
                          </span>
                        </div>
                        <CardDescription className="text-sm text-gray-900 line-clamp-3">
                          {question.content}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={question.isActive}
                          onCheckedChange={() => handleToggleStatus(question)}
                          disabled={statusToggleLoading === question.id}
                        />
                        <span className="text-sm text-gray-600">
                          {statusToggleLoading === question.id ? 'Updating...' : 'Active'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Results Summary */}
        {filteredQuestions.length > 0 && !showCreateForm && (
          <div className="flex items-center justify-between text-sm text-gray-700 bg-white p-4 rounded-lg border">
            <div>
              <p>
                Showing <span className="font-medium">{filteredQuestions.length}</span> of{" "}
                <span className="font-medium">{questions.length}</span> questions
              </p>
              {(searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all") && (
                <p className="text-xs text-gray-500 mt-1">
                  {searchTerm && `Search: "${searchTerm}"`}
                  {searchTerm && (selectedStatus !== "all" || selectedDifficulty !== "all") && " | "}
                  {selectedStatus !== "all" && `Status: ${selectedStatus === "active" ? "Active" : "Inactive"}`}
                  {selectedStatus !== "all" && selectedDifficulty !== "all" && " | "}
                  {selectedDifficulty !== "all" && `Difficulty: ${getDifficultyLevelText(parseInt(selectedDifficulty))}`}
                </p>
              )}
            </div>
            {(searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionManagementPage;


