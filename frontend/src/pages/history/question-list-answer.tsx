"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft } from "lucide-react"
import axios from "axios"

interface SessionAnswer {
  id: number
  userAnswer: string
  feedback: string
  score: number
  answeredAt: string
  question: {
    title: string
    content: string
    category?: string
    difficulty?: string
  }
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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
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
  const pageSize = 3

  useEffect(() => {
    const fetchSessionOverview = async () => {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get<SessionOverview[]>(
          `https://localhost:2004/api/customer/practiceHistory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
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
        const res = await axios.get<SessionAnswer[]>(
          `https://localhost:2004/api/customer/getAnswer/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setAllQuestions(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load questions")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchQuestions()
  }, [id])

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
            <h1 className="text-3xl font-bold text-gray-900">Session Questions</h1>
            <p className="mt-2 text-gray-600">Review your answers and feedback</p>
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
            <CardDescription>Performance summary for this practice session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">{displayedScore}/100</div>
                <div className="text-sm text-gray-600">Overall Score</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${displayedScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Categories Practiced */}
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">Categories Practiced</div>
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

              {/* Performance Breakdown */}
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">Performance Breakdown</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Answered:</span>
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
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Questions in Session</CardTitle>
            <CardDescription>Detailed breakdown of each question and your performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pagedQuestions.map((q, index) => {
              const hasAnswered = q.userAnswer?.trim()
              const questionNumber = (page - 1) * pageSize + index + 1

              return (
                <div key={q.id} className="border rounded-lg p-4 space-y-4">
                  {/* Question Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Question {questionNumber}</span>
                        {q.question.category && (
                          <Badge variant="outline" className="text-xs">
                            {q.question.category}
                          </Badge>
                        )}
                        {q.question.difficulty && (
                          <Badge className={`text-xs ${getDifficultyColor(q.question.difficulty)}`}>
                            {q.question.difficulty}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {q.question?.content || "Untitled Question"}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(q.answeredAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasAnswered ? (
                        <Badge className={getScoreColor(q.score)}>{q.score}/100</Badge>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/answer/${q.id}`)}>
                          Answer this question
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Answer and Feedback */}
                  {hasAnswered && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Your Answer</p>
                        <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{q.userAnswer}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Feedback</p>
                        <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">
                          {q.feedback || "No feedback provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-gray-700 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
