import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Ensure react-hot-toast is installed

import {
    getStaffQuestions,
    createQuestion,
    updateQuestionStatus,
    updateQuestionInfo,
    importQuestionsFromExcel,
    downloadQuestionExcelTemplate, // Import new function
    getQuestionById, // Import function to get question details for editing
    QuestionForStaff,
    CreateQuestionDTO,
    UpdateQuestionStatusDTO,
    UpdateQuestionInfoDTO,
    getDifficultyLevelText, // Helper
    getDifficultyLevelColor // Helper
} from '../../services/questionService'; // Ensure correct service file path

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"; // You have Textarea but it's not used in the provided code

// Form Component (Assuming you already have it and it's placed at '@/components/QuestionForm')
// Ensure QuestionForm receives the correct props and uses CreateQuestionDTO/UpdateQuestionInfoDTO
import QuestionForm from '@/components/QuestionForm';

// Icons
import {
    PlusCircle,
    Edit,
    ArrowLeft,
    Search,
    Filter,
    RefreshCw,
    Upload, // Icon for Import Excel
    Download, // Icon for Download Template
    FileText, // Icon for No Questions Found
    BarChart3, // Icon for Analytics
    Eye,
    EyeOff
} from "lucide-react";


const QuestionManagementPage: React.FC = () => {
    const [questions, setQuestions] = useState<QuestionForStaff[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<QuestionForStaff[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State for add/edit functionality
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionForStaff | null>(null);
    const [fetchingEditQuestion, setFetchingEditQuestion] = useState<boolean>(false); // State for loading question details for editing

    // State for status toggle of each question
    const [statusToggleLoading, setStatusToggleLoading] = useState<number | null>(null);

    // State for Excel import
    const [importLoading, setImportLoading] = useState<boolean>(false);

    // Fetch questions from API
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStaffQuestions();
            // Filter out questions with invalid IDs (as you were doing)
            const validQuestions = data.filter(q => q.id !== undefined && q.id !== null);
            setQuestions(validQuestions);
            console.log('Fetched questions:', validQuestions);
            if (data.length !== validQuestions.length) {
                console.warn('Warning: Some questions with invalid IDs were removed.');
                // You could display a small warning to the user
                // setErrorMessage('Some questions with invalid IDs were removed from the list.');
                // setTimeout(() => setErrorMessage(null), 5000);
            }
        } catch (err: any) {
            console.error("Error fetching questions:", err);
            setError(err.message || 'Failed to fetch questions. Please ensure the backend is running and accessible.');
            toast.error(err.message || 'Unable to load questions.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch on component mount
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Filter questions based on search, status, and difficulty whenever state changes
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
                question.difficultyLevel.toString() === selectedDifficulty // Convert to string for comparison
            );
        }

        setFilteredQuestions(filtered);
    }, [questions, searchTerm, selectedStatus, selectedDifficulty]);


    // Handle adding a new question
    const handleCreateNewQuestion = async (newQuestion: CreateQuestionDTO) => {
        setIsSubmittingForm(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const createdQuestion = await createQuestion(newQuestion);
            setQuestions(prev => [...prev, createdQuestion]);
            setSuccessMessage(`Question created successfully!`);
            setShowCreateForm(false);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error creating question:', error);
            setErrorMessage(error.message || 'Unable to create question. Please check the entered information.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    // Handle updating an existing question
    const handleUpdateQuestion = async (updatedQuestion: CreateQuestionDTO) => {
        if (!editingQuestion) return; // Should not happen if editingQuestion is set

        setIsSubmittingForm(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            // Map CreateQuestionDTO to UpdateQuestionInfoDTO (since they have similar fields for update)
            const updateDto: UpdateQuestionInfoDTO = {
                content: updatedQuestion.content,
                sampleAnswer: updatedQuestion.sampleAnswer,
                difficultyLevel: updatedQuestion.difficultyLevel,
                categoryIds: updatedQuestion.categoryIds,
                tagNames: updatedQuestion.tagNames
            };

            const updated = await updateQuestionInfo(editingQuestion.id, updateDto);
            setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
            setSuccessMessage(`Question updated successfully!`);
            setEditingQuestion(null); // Clear editing state
            setShowCreateForm(false); // Close form
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error updating question:', error);
            setErrorMessage(error.message || 'Unable to update question. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    // Handle toggling question status (Active/Inactive)
    const handleToggleStatus = async (question: QuestionForStaff) => {
        // Basic validation for question ID
        if (question.id === undefined || question.id === null) {
            console.error('Error: Question ID is undefined. Cannot update status.');
            toast.error('Error: Question ID is undefined. Cannot update status.');
            return;
        }

        setStatusToggleLoading(question.id); // Set loading state for this specific question
        setErrorMessage(null); // Clear previous errors

        try {
            const statusDto: UpdateQuestionStatusDTO = {
                isActive: !question.isActive // Toggle status
            };

            const updatedQuestion = await updateQuestionStatus(question.id, statusDto);

            setQuestions(prev => prev.map(q => q.id === question.id ? updatedQuestion : q)); // Update questions state
            
            const statusText = updatedQuestion.isActive ? 'activated' : 'deactivated';
            setSuccessMessage(`Question has been ${statusText} successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            console.error('Error toggling question status:', error);
            console.error('Error details:', error.response?.data);
            setErrorMessage(error.message || 'Unable to update question status. Please try again.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setStatusToggleLoading(null); // Clear loading state
        }
    };

    // Handle opening the edit form and fetching full details
    const handleEditQuestion = async (question: QuestionForStaff) => {
        setFetchingEditQuestion(true); // Indicate loading for edit form
        setErrorMessage(null);
        try {
            // Fetch the full question details including categories and tags for the form
            // Assuming getQuestionById returns a QuestionForStaff with all necessary fields
            const fullQuestionDetails = await getQuestionById(question.id);
            setEditingQuestion(fullQuestionDetails);
            setShowCreateForm(true); // Open the form
        } catch (error: any) {
            console.error('Error fetching question for edit:', error);
            setErrorMessage(error.message || 'Unable to load question details for editing. Please try again.');
        } finally {
            setFetchingEditQuestion(false); // End loading for edit form
        }
    };

    // Handle canceling add/edit form
    const handleCancelEdit = () => {
        setEditingQuestion(null); // Clear editing state
        setShowCreateForm(false); // Close form
    };

    // Handle Excel file import
    const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            toast.error("Please select an Excel file.");
            return;
        }

        setImportLoading(true);
        setErrorMessage(null);
        try {
            const importedQuestions = await importQuestionsFromExcel(file);
            // Only add questions with valid IDs (as per your existing logic)
            const validImportedQuestions = importedQuestions.filter(q => q.id !== undefined && q.id !== null);
            setQuestions(prev => [...prev, ...validImportedQuestions]);
            toast.success(`Successfully imported ${validImportedQuestions.length} questions from Excel file!`);
            if (importedQuestions.length !== validImportedQuestions.length) {
                toast.warn('Some questions from Excel had invalid IDs and were skipped.');
            }
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error importing Excel:', error);
            setErrorMessage(error.message || 'Unable to import Excel file. Please check the file format.');
            setTimeout(() => setErrorMessage(null), 5000);
        } finally {
            setImportLoading(false);
            // Reset input file to allow selecting the same file again if needed
            event.target.value = '';
        }
    };

    // New function: Handle Excel template download
    const handleDownloadExcelTemplate = async () => {
        try {
            const blob = await downloadQuestionExcelTemplate();
            // Create object URL and create a hidden anchor tag to download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'QuestionTemplate.xlsx'; // File name when downloaded
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Free the object URL
            toast.success("Excel template downloaded successfully!");
        } catch (err: any) {
            console.error("Error downloading Excel template:", err);
            toast.error(err.message || "Unable to download Excel template.");
        }
    };

    // Helper to get status color (active/inactive)
    const getStatusColor = (isActive: boolean) => {
        return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchQuestions(); // Re-fetch all questions
        clearFilters(); // Clear search and filters
        setShowCreateForm(false); // Close any open form
        setEditingQuestion(null); // Clear editing state
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSelectedDifficulty("all");
    };

    // Loading state UI
    if (loading || fetchingEditQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">{fetchingEditQuestion ? 'Loading question details...' : 'Loading questions...'}</p>
                </div>
            </div>
        );
    }

    // Error state UI
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-semibold">Error Loading Questions</p>
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
            {/* Header Section */}
            <header className="bg-white shadow-sm border-b">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                            <p className="mt-2 text-gray-600">
                                Manage interview questions for your system
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Total questions: {questions.length}
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
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    Import Excel
                                </Button>
                            </div>

                            {/* Download Excel Template Button */}
                            <Button variant="outline" onClick={handleDownloadExcelTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </Button>

                            <Button onClick={() => setShowCreateForm(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Question
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Section */}
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
                                <span className="text-sm font-medium text-gray-700">Filters:</span>
                            </div>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active only</SelectItem>
                                    <SelectItem value="inactive">Inactive only</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All difficulty levels</SelectItem>
                                    <SelectItem value="0">Easy</SelectItem> {/* Assuming 0 for Easy */}
                                    <SelectItem value="1">Medium</SelectItem> {/* Assuming 1 for Medium */}
                                    <SelectItem value="2">Hard</SelectItem> {/* Assuming 2 for Hard */}
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
                                        ? "No questions found matching the filters" 
                                        : "No questions yet"}
                                </p>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || selectedStatus !== "all" || selectedDifficulty !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Get started by creating your first question"}
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
                                                        Usage count: {question.usageCount}
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
                                                {/* Add View Answer button if you want to display sampleAnswer in a separate modal */}
                                                {/* <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Answer
                                                </Button> */}
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