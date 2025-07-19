import { useEffect, useState } from "react"
import axios from "axios"

export enum SessionType {
  MockInterview = 1,
  Practice = 2,
}

export enum SessionStatus {
  Completed = 1,
  OnProgress = 2,
}

export interface PracticeSession {
  id: number
  userId: string
  sessionType: SessionType
  numberOfQuestions: number
  status: SessionStatus
  statusName: string   
  overallScore: number
  startedAt: string
  completedAt?: string
}

export const usePracticeHistory = () => {
  const [data, setData] = useState<PracticeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<PracticeSession[]>(
          "https://localhost:2004/api/customer/practiceHistory",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        setData(res.data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
