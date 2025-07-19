"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  usePracticeHistory,
  PracticeSession,
} from "@/services/MockSessionSerivce"

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

const transformSession = (session: PracticeSession) => {
  const start = new Date(session.startedAt)
  const end = session.completedAt ? new Date(session.completedAt) : null
  const durationMinutes = end
    ? Math.round((end.getTime() - start.getTime()) / 60000)
    : 0

  return {
    id: session.id,
    date: start.toISOString().split("T")[0],
    time: start.toTimeString().slice(0, 5),
    totalScore: Math.round(session.overallScore ?? 0),
    questionsCount: session.numberOfQuestions,
    duration: `${durationMinutes} min`,
    statusName: session.statusName,
  }
}

export function PracticeHistory() {
  const navigate = useNavigate()
  const { data: rawSessions, loading, error } = usePracticeHistory()

  const [page, setPage] = useState(1)
  const pageSize = 5

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  const sessions = rawSessions.map(transformSession)
  const totalPages = Math.ceil(sessions.length / pageSize)
  const pagedSessions = sessions.slice((page - 1) * pageSize, page * pageSize)

  const averageScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.totalScore, 0) / sessions.length)
    : 0

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(startIndex + pageSize - 1, sessions.length)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice History</h1>
              <p className="mt-2 text-gray-600">Track your progress and review past sessions</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your practice session history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pagedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {session.time}
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {session.questionsCount} questions
                      </div>
                      <span>{session.duration}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getScoreColor(session.totalScore)}>
                        Score: {session.totalScore}/100
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/session-detail/${session.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{sessions.length}</span> sessions
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
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
