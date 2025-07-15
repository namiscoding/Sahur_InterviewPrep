"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void
  resetParams: {
    email: string
    token: string
  }
}

export default function ResetPasswordPage({ onNavigate, resetParams }: ResetPasswordPageProps) {
  const { email, token } = resetParams

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !token) {
      toast.error("❌ Link không hợp lệ hoặc thiếu thông tin.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("https://localhost:2004/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          confirmPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error) toast.error(data.error)
        else if (data.errors) {
          const errMsg = Object.values(data.errors).flat().join("\n")
          toast.error(errMsg)
        } else {
          toast.error("❌ Changing passoword fail.")
        }
      } else {
        toast.success("✅Password change")
        setTimeout(() => onNavigate("login"), 2500)
      }
    } catch (err) {
      toast.error("❌ Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
