"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Target, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router-dom'; // Thêm import này

const sessions = [
  {
    id: 1,
    date: "2024-01-15",
    time: "14:30",
    totalScore: 85,
    questionsCount: 5,
    categories: ["Data Structures", "Algorithms"],
    duration: "45 min",
  },
  {
    id: 2,
    date: "2024-01-14",
    time: "10:15",
    totalScore: 92,
    questionsCount: 3,
    categories: ["System Design"],
    duration: "60 min",
  },
  {
    id: 3,
    date: "2024-01-12",
    time: "16:45",
    totalScore: 78,
    questionsCount: 4,
    categories: ["Data Structures", "Behavioral"],
    duration: "35 min",
  },
  {
    id: 4,
    date: "2024-01-10",
    time: "09:20",
    totalScore: 88,
    questionsCount: 6,
    categories: ["Algorithms", "System Design"],
    duration: "55 min",
  },
  {
    id: 5,
    date: "2024-01-08",
    time: "13:10",
    totalScore: 76,
    questionsCount: 3,
    categories: ["Behavioral"],
    duration: "25 min",
  },
]

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

// Xóa interface PracticeHistoryProps vì không còn cần thiết
// interface PracticeHistoryProps {
//   onNavigate: (page: string) => void
// }

// Sửa signature của component
export function PracticeHistory() {
  const navigate = useNavigate(); // Khởi tạo hook

  const averageScore = Math.round(sessions.reduce((sum, session) => sum + session.totalScore, 0) / sessions.length)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice History</h1>
              <p className="mt-2 text-gray-600">Track your progress and review past sessions</p>
            </div>
            {/* Thay thế onNavigate bằng navigate */}
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900">4.5h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your practice session history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Target className="h-4 w-4 mr-1" />
                        {session.questionsCount} questions
                      </div>
                      <span className="text-sm text-gray-500">{session.duration}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getScoreColor(session.totalScore)}>Score: {session.totalScore}/100</Badge>
                      {session.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Thay thế onNavigate bằng navigate và thêm ID vào URL nếu cần */}
                  <Button variant="outline" size="sm" onClick={() => navigate(`/session-detail/${session.id}`)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{" "}
                <span className="font-medium">12</span> sessions
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}