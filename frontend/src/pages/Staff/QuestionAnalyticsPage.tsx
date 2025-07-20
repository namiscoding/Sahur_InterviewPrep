import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Trophy, Calendar, Filter, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';
import { 
  QuestionForStaff, 
  CategoryUsageTrend, 
  getQuestionsUsageRanking, 
  getCategoryUsageTrends,
  getDifficultyLevelText,
  getDifficultyLevelColor
} from '../../services/questionService';
import { getStaffCategories, Category } from '../../services/categoryService';

const QuestionAnalyticsPage: React.FC = () => {
  // State for Top N Questions
  const [topQuestions, setTopQuestions] = useState<QuestionForStaff[]>([]);
  const [topQuestionsLoading, setTopQuestionsLoading] = useState(false);
  
  // State for Category Usage Trends
  const [categoryTrends, setCategoryTrends] = useState<CategoryUsageTrend[]>([]);
  const [categoryTrendsLoading, setCategoryTrendsLoading] = useState(false);
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Filter states for Top N Questions
  const [topNFilters, setTopNFilters] = useState({
    selectedCategoryIds: [] as number[],
    startDate: '',
    endDate: '',
    orderByUsageDescending: true,
    topN: 10
  });
  
  // Filter states for Category Trends
  const [trendsFilters, setTrendsFilters] = useState({
    selectedCategoryIds: [] as number[],
    startDate: '',
    endDate: '',
    timeUnit: 'month'
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getStaffCategories();
        setCategories(data.filter(c => c.isActive));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch Top N Questions
  const fetchTopQuestions = async () => {
    try {
      setTopQuestionsLoading(true);
      const data = await getQuestionsUsageRanking(
        topNFilters.selectedCategoryIds.length > 0 ? topNFilters.selectedCategoryIds : undefined,
        topNFilters.startDate || undefined,
        topNFilters.endDate || undefined,
        topNFilters.orderByUsageDescending,
        topNFilters.topN
      );
      setTopQuestions(data);
    } catch (error) {
      console.error('Error fetching top questions:', error);
    } finally {
      setTopQuestionsLoading(false);
    }
  };

  // Fetch Category Usage Trends
  const fetchCategoryTrends = async () => {
    try {
      setCategoryTrendsLoading(true);
      const data = await getCategoryUsageTrends(
        trendsFilters.selectedCategoryIds.length > 0 ? trendsFilters.selectedCategoryIds : undefined,
        trendsFilters.startDate || undefined,
        trendsFilters.endDate || undefined,
        trendsFilters.timeUnit
      );
      setCategoryTrends(data);
    } catch (error) {
      console.error('Error fetching category trends:', error);
    } finally {
      setCategoryTrendsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTopQuestions();
    fetchCategoryTrends();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTopQuestions();
    fetchCategoryTrends();
  };

  // Handle category selection for Top N
  const handleTopNCategoryToggle = (categoryId: number) => {
    setTopNFilters(prev => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(categoryId)
        ? prev.selectedCategoryIds.filter(id => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId]
    }));
  };

  // Handle category selection for Trends
  const handleTrendsCategoryToggle = (categoryId: number) => {
    setTrendsFilters(prev => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(categoryId)
        ? prev.selectedCategoryIds.filter(id => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId]
    }));
  };

  // Prepare chart data for category trends
  const chartData = categoryTrends.reduce((acc, trend) => {
    const existingPeriod = acc.find(item => item.period === trend.period);
    if (existingPeriod) {
      existingPeriod[trend.categoryName] = trend.totalUsageCount;
    } else {
      acc.push({
        period: trend.period,
        [trend.categoryName]: trend.totalUsageCount
      });
    }
    return acc;
  }, [] as any[]);

  // Get unique category names for chart legend
  const uniqueCategoryNames = [...new Set(categoryTrends.map(trend => trend.categoryName))];

  // Generate colors for chart lines
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Analytics</h1>
          <p className="text-gray-600">Analyze question usage patterns and trends</p>
          <div className="flex gap-3 mt-4">
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
              
            </div>
        </div>

        <Tabs defaultValue="top-questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="top-questions" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top Questions
            </TabsTrigger>
            <TabsTrigger value="category-trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Category Trends
            </TabsTrigger>
          </TabsList>

          {/* Top N Questions Tab */}
          <TabsContent value="top-questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <Label htmlFor="topn-start-date">Start Date</Label>
                    <Input
                      id="topn-start-date"
                      type="date"
                      value={topNFilters.startDate}
                      onChange={(e) => setTopNFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="topn-end-date">End Date</Label>
                    <Input
                      id="topn-end-date"
                      type="date"
                      value={topNFilters.endDate}
                      onChange={(e) => setTopNFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  
                  {/* Top N */}
                  <div>
                    <Label htmlFor="topn-limit">Top N</Label>
                    <Input
                      id="topn-limit"
                      type="number"
                      min="1"
                      max="100"
                      value={topNFilters.topN}
                      onChange={(e) => setTopNFilters(prev => ({ ...prev, topN: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                  
                  {/* Order */}
                  <div>
                    <Label htmlFor="topn-order">Order</Label>
                    <Select 
                      value={topNFilters.orderByUsageDescending.toString()} 
                      onValueChange={(value) => setTopNFilters(prev => ({ ...prev, orderByUsageDescending: value === 'true' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Highest Usage First</SelectItem>
                        <SelectItem value="false">Lowest Usage First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label>Categories (optional)</Label>
                  {categoriesLoading ? (
                    <div className="mt-2 text-sm text-gray-500">Loading categories...</div>
                  ) : (
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`topn-category-${category.id}`}
                            checked={topNFilters.selectedCategoryIds.includes(category.id)}
                            onChange={() => handleTopNCategoryToggle(category.id)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`topn-category-${category.id}`} className="text-sm font-normal cursor-pointer">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {topNFilters.selectedCategoryIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {topNFilters.selectedCategoryIds.map(categoryId => {
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

                <Button onClick={fetchTopQuestions} disabled={topQuestionsLoading} className="w-full md:w-auto">
                  {topQuestionsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Top Questions Results */}
            <Card>
              <CardHeader>
                <CardTitle>Top {topNFilters.topN} Questions by Usage</CardTitle>
                <CardDescription>
                  Questions ranked by usage count {topNFilters.orderByUsageDescending ? '(highest first)' : '(lowest first)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topQuestionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading questions...
                  </div>
                ) : topQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No questions found with the current filters.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topQuestions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyLevelColor(question.difficultyLevel)}`}>
                                {getDifficultyLevelText(question.difficultyLevel)}
                              </Badge>
                              <Badge variant={question.isActive ? "default" : "secondary"} className="text-xs">
                                {question.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{question.content}</p>
                            {question.categories && question.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {question.categories.map(category => (
                                  <Badge key={category.id} variant="secondary" className="text-xs">
                                    {category.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">{question.usageCount}</div>
                            <div className="text-xs text-gray-500">uses</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Trends Tab */}
          <TabsContent value="category-trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <Label htmlFor="trends-start-date">Start Date</Label>
                    <Input
                      id="trends-start-date"
                      type="date"
                      value={trendsFilters.startDate}
                      onChange={(e) => setTrendsFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trends-end-date">End Date</Label>
                    <Input
                      id="trends-end-date"
                      type="date"
                      value={trendsFilters.endDate}
                      onChange={(e) => setTrendsFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  
                  {/* Time Unit */}
                  <div>
                    <Label htmlFor="trends-time-unit">Time Unit</Label>
                    <Select 
                      value={trendsFilters.timeUnit} 
                      onValueChange={(value) => setTrendsFilters(prev => ({ ...prev, timeUnit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="week">Weekly</SelectItem>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="quarter">Quarterly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label>Categories (optional)</Label>
                  {categoriesLoading ? (
                    <div className="mt-2 text-sm text-gray-500">Loading categories...</div>
                  ) : (
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`trends-category-${category.id}`}
                            checked={trendsFilters.selectedCategoryIds.includes(category.id)}
                            onChange={() => handleTrendsCategoryToggle(category.id)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`trends-category-${category.id}`} className="text-sm font-normal cursor-pointer">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {trendsFilters.selectedCategoryIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {trendsFilters.selectedCategoryIds.map(categoryId => {
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

                <Button onClick={fetchCategoryTrends} disabled={categoryTrendsLoading} className="w-full md:w-auto">
                  {categoryTrendsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Category Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Usage Trends</CardTitle>
                <CardDescription>
                  Usage trends over time by category ({trendsFilters.timeUnit}ly)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryTrendsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading trends...
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No trend data found with the current filters.
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {uniqueCategoryNames.map((categoryName, index) => (
                          <Line
                            key={categoryName}
                            type="monotone"
                            dataKey={categoryName}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Trends Table */}
            {categoryTrends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Trends Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Period</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-right p-2">Total Usage</th>
                          <th className="text-right p-2">Questions Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryTrends.map((trend, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{trend.period}</td>
                            <td className="p-2">
                              <Badge variant="secondary" className="text-xs">
                                {trend.categoryName}
                              </Badge>
                            </td>
                            <td className="p-2 text-right font-medium">{trend.totalUsageCount}</td>
                            <td className="p-2 text-right">{trend.numberOfQuestions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestionAnalyticsPage;
