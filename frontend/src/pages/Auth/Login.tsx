"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 1. Import useAuth

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Lấy hàm login từ AuthContext

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrUserName: "", 
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 3. Gọi hàm login từ context
      // Hàm này sẽ tự động gọi API, lưu token và cập nhật state
      await login(credentials);

      toast.success("Đăng nhập thành công!");

      // 4. Chuyển hướng người dùng sau khi đăng nhập
      // Logic chuyển hướng dựa trên vai trò có thể được xử lý ở đây
      // hoặc trong một component riêng biệt lắng nghe trạng thái đăng nhập.
      // Ở đây, chúng ta sẽ chuyển hướng đến trang dashboard mặc định.
      navigate("/dashboard");

    } catch (err) {
      // AuthContext sẽ throw lỗi nếu đăng nhập thất bại
      toast.error("Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập vào tài khoản
          </CardTitle>
          <CardDescription className="text-center">
            Truy cập nền tảng Luyện Phỏng Vấn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="emailOrUserName" // Sửa name
                type="email"
                placeholder="Nhập email của bạn"
                value={credentials.emailOrUserName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Ghi nhớ tôi
                </Label>
              </div>
              <a
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Chưa có tài khoản?{" "}
            <a
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
            >
              Đăng ký
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}