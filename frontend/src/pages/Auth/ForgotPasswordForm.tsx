"use client"

import React, { useState } from "react"
// Import useNavigate từ react-router-dom
import { useNavigate } from 'react-router-dom'; // <--- THÊM DÒNG NÀY

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

// XÓA HOẶC BỎ COMMENT INTERFACE NÀY
// interface ForgotPasswordFormProps {
//   onNavigate: (page: string) => void
// }

// Cập nhật kiểu cho component và bỏ destructuring prop onNavigate
export function ForgotPasswordForm() { // <--- SỬA DÒNG NÀY
  // Khởi tạo useNavigate hook
  const navigate = useNavigate(); // <--- THÊM DÒNG NÀY

  const [emailOrUserName, setEmailOrUserName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const res = await fetch("https://localhost:2004/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emailOrUserName })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error) setError(data.error)
        else if (data.errors) {
          const msg = Object.values(data.errors).flat().join("\n")
          setError(msg)
        } else setError("Đã xảy ra lỗi không xác định.")
      } else {
        setMessage(data.message || "Nếu email tồn tại, hướng dẫn đã được gửi.")
        // THAY THẾ onNavigate("login") bằng navigate("/login")
        setTimeout(() => navigate("/login"), 3000) // <--- SỬA DÒNG NÀY
      }
    } catch (err) {
      setError("Lỗi mạng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email or username. We’ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUserName">Email or Username</Label>
              <Input
                id="emailOrUserName"
                type="text"
                placeholder="Enter your email or username"
                value={emailOrUserName}
                onChange={(e) => setEmailOrUserName(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          {message && (
            <p className="text-green-600 text-sm text-center whitespace-pre-line">{message}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center whitespace-pre-line">{error}</p>
          )}

          <div className="text-center">
            <a
              onClick={() => navigate("/login")} // <--- SỬA DÒNG NÀY
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 cursor-pointer" // Thêm cursor-pointer để hiển thị đây là một hành động click
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}