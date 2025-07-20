"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Calendar,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import axios from "axios"

// Interface theo DTO của bạn
export interface Feedback {
  overall: string
  strengths: string[]
  improvements: string[]
}

interface SessionAnswer {
  id: number
  userAnswer: string
  feedback: Feedback | string // Có thể là object Feedback hoặc string cũ
  score: number
  answeredAt: string
  question: {
    title: string
    content: string
    category?: string
    difficulty?: string
  }
  sampleAnswer?: string
}

interface SessionOverview {
  id: number
  overallScore: number | null
  numberOfQuestions?: number
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excellent"
  if (score >= 80) return "Good"
  if (score >= 60) return "Fair"
  if (score >= 40) return "Average"
  return "Needs Improvement"
}

const getScoreProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-yellow-500"
  return "bg-red-500"
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800 border-green-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "hard":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getCategoryColor = (category: string) => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-pink-100 text-pink-800 border-pink-200",
  ]
  const hash = category?.split("").reduce((a, b) => a + b.charCodeAt(0), 0) || 0
  return colors[hash % colors.length]
} 

const parseFeedback = (feedback: Feedback | string): Feedback => {
  try {
    if (typeof feedback === "string") {
      // If it's a double-escaped JSON string
      let parsed = feedback
      if (feedback.trim().startsWith("{\"")) {
        parsed = JSON.parse(feedback)
      }
      const result = JSON.parse(parsed)
      const { overall, strengths, improvements } = result
      return {
        overall: overall || "No overall feedback",
        strengths: Array.isArray(strengths) ? strengths : [],
        improvements: Array.isArray(improvements) ? improvements : [],
      }
    }
    // If it's already an object
    const { overall, strengths, improvements } = feedback
    return {
      overall: overall || "No overall feedback",
      strengths: Array.isArray(strengths) ? strengths : [],
      improvements: Array.isArray(improvements) ? improvements : [],
    }
  } catch (error) {
    console.error("Feedback parse error:", error)
    return {
      overall: "No overall feedback",
      strengths: [],
      improvements: [],
    }
  }
}



export function SessionQuestionList() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [allQuestions, setAllQuestions] = useState<SessionAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionOverview, setSessionOverview] = useState<SessionOverview | null>(null)
  const [page, setPage] = useState(1)
  const [expandedSamples, setExpandedSamples] = useState<Set<number>>(new Set())
  const pageSize = 3

  useEffect(() => {
    const fetchSessionOverview = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get<SessionOverview[]>(`https://localhost:2004/api/customer/practiceHistory`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const session = res.data.find((s) => s.id.toString() === id)
        if (session) setSessionOverview(session)
      } catch (err) {
        console.error("Failed to fetch session overview")
      }
    }
    if (id) fetchSessionOverview()
  }, [id])

  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem("token")
      setLoading(true)
      try {
        const res = await axios.get<SessionAnswer[]>(`https://localhost:2004/api/customer/getAnswer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Xử lý data từ API - không cần mock nữa vì đã có DTO
        const processedData = res.data.map((item) => ({
          ...item,
          // Đảm bảo feedback được parse đúng
          feedback: item.feedback,
          // Sample answer có thể được thêm từ API hoặc để trống
          sampleAnswer:
            item.sampleAnswer ||
            `This is a detailed sample answer for the question "${item.question.title}". 

The sample answer will be updated by the system based on the question content and specific requirements.

Key points to mention:
- Basic concepts
- Illustrative examples
- Comparison and analysis
- Conclusion

Note: This is a reference answer, you may have a different approach.`,
        }))

        setAllQuestions(processedData)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load questions")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchQuestions()
  }, [id])

  const toggleSampleAnswer = (questionId: number) => {
    const newExpanded = new Set(expandedSamples)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedSamples(newExpanded)
  }

  const answeredQuestions = allQuestions.filter((q) => q.userAnswer?.trim())
  const averageScore =
    answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length)
      : 0

  const categories = [...new Set(allQuestions.map((q) => q.question.category).filter(Boolean))]
  const totalPages = Math.ceil(allQuestions.length / pageSize)
  const pagedQuestions = allQuestions.slice((page - 1) * pageSize, page * pageSize)
  const displayedScore = sessionOverview?.overallScore ?? averageScore

  if (loading) return <div className="p-6 text-gray-500">Loading questions...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practice Session Details</h1>
            <p className="mt-2 text-gray-600">Review your answers and detailed feedback</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/practice-history")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to History
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Session Overview */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Session Overview</CardTitle>
            <CardDescription>Summary of your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">{displayedScore}/100</div>
                <div className="text-sm text-gray-600">Total Score</div>
                <Progress value={displayedScore} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">Practiced Topics</div>
                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      General
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">Detailed Statistics</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answered Questions:</span>
                    <span className="font-medium">{answeredQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-medium">{displayedScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions in Session */}
        <div className="space-y-6">
          {pagedQuestions.map((q, index) => {
            const hasAnswered = q.userAnswer?.trim()
            const questionNumber = (page - 1) * pageSize + index + 1
            const isExpanded = expandedSamples.has(q.id)

            // Parse feedback using your DTO
            const feedbackData = parseFeedback(q.feedback)

            return (
              <Card key={q.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Question Header with Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {q.question.category && (
                        <Badge className={`text-xs font-medium ${getCategoryColor(q.question.category)}`}>
                          {q.question.category}
                        </Badge>
                      )}
                      {q.question.difficulty && (
                        <Badge className={`text-xs font-medium ${getDifficultyColor(q.question.difficulty)}`}>
                          {q.question.difficulty}
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      {q.question.content || "Untitled question"}
                    </h2>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>Answered at: {new Date(q.answeredAt).toLocaleString("en-US")}</span>
                    </div>
                  </div>

                  {hasAnswered ? (
                    <div className="space-y-6">
                      {/* User Answer Section */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">Your Answer</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{q.userAnswer}</p>
                      </div>

                      {/* Score Section */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-900">Your Score</span>
                          <span className="text-2xl font-bold text-orange-600">{q.score} / 100</span>
                        </div>

                        <div className="flex items-center mb-2">
                          <div className="flex items-center text-orange-600 mr-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                            <span className="font-medium">{getScoreLabel(q.score)}</span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getScoreProgressColor(q.score)}`}
                            style={{ width: `${q.score}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Feedback Section - Using DTO */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">General Feedback</span>
                        </div>
                        <p className="text-blue-800 text-sm">{feedbackData.overall}</p>
                      </div>

                      {/* Strengths and Improvements - Using DTO */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-green-900">Strengths</span>
                          </div>
                          <ul className="space-y-2">
                            {feedbackData.strengths.length > 0 ? (
                              feedbackData.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start text-sm text-green-800">
                                  <CheckCircle className="h-3 w-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))
                            ) : (
                              <li className="flex items-start text-sm text-green-800">
                                <CheckCircle className="h-3 w-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                Made an effort to answer the question
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Areas for Improvement */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="font-medium text-yellow-900">Areas for Improvement</span>
                          </div>
                          <ul className="space-y-2">
                            {feedbackData.improvements.length > 0 ? (
                              feedbackData.improvements.map((improvement, idx) => (
                                <li key={idx} className="flex items-start text-sm text-yellow-800">
                                  <AlertTriangle className="h-3 w-3 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  {improvement}
                                </li>
                              ))
                            ) : (
                              <li className="flex items-start text-sm text-yellow-800">
                                <AlertTriangle className="h-3 w-3 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                Keep up the good work
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Sample Answer Section */}
                      <div className="border-t pt-4">
                        <Collapsible open={isExpanded} onOpenChange={() => toggleSampleAnswer(q.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                              <span className="font-medium text-gray-900">Sample Answer</span>
                              <div className="flex items-center">
                                <Button variant="outline" size="sm" className="mr-2 bg-transparent">
                                  {isExpanded ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-1" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      Show
                                    </>
                                  )}
                                </Button>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4">
                            <div className="bg-gray-50 border rounded-lg p-4">
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                                {q.sampleAnswer || "Sample answer will be updated later."}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <MessageSquare className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">You have not answered this question yet</p>
                      <Button onClick={() => navigate(`/answer/${q.id}`)}>Answer now</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
              Previous Page
            </Button>
            <span className="text-gray-700 text-sm">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next Page
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
