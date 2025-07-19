"use client"

import React, { useState, useEffect } from "react" // Thêm useEffect
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useNavigate, useSearchParams } from 'react-router-dom'; // Thêm import này

export default function ResetPasswordPage() { // Sửa signature của component
  const navigate = useNavigate(); // Khởi tạo hook
  const [searchParams] = useSearchParams(); // Khởi tạo hook để đọc query params

  const [email, setEmail] = useState<string>(''); // Quản lý email và token trong state
  const [token, setToken] = useState<string>('');

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Lấy email và token từ URL query parameters
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    if (!emailParam || !tokenParam) {
      toast.error("❌ Link không hợp lệ hoặc thiếu thông tin.");
      // Tùy chọn: chuyển hướng về trang login nếu link không hợp lệ
      navigate("/login");
    }
  }, [searchParams, navigate]); // Dependencies cho useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !token) {
      toast.error("❌ Link không hợp lệ hoặc thiếu thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu xác nhận không khớp.");
      return;
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
        setTimeout(() => navigate("/login"), 2500) // Thay thế onNavigate
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