"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // 1. Import useAuth
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types/auth.types";

declare global {
  interface Window {
    google: any;
  }
}
  const getRedirectPath = (user: User | null): string => {
    if (!user?.roles) {
      return '/'; // Trang mặc định nếu có lỗi
    }

    // Ưu tiên vai trò có quyền cao nhất
    if (user.roles.includes('SystemAdmin')) {
      return '/systemadmin/dashboard';
    }
    if (user.roles.includes('UserAdmin')) {
      return '/admin/dashboard';
    }
    if (user.roles.includes('Staff')) {
      return '/staff-dashboard';
    }
    if (user.roles.includes('Customer')) {
      return '/questions';
    }

    return '/'; // Fallback
  };

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth(); // 2. Lấy các hàm từ AuthContext

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
      // 1. Gọi hàm login từ context, hàm này trả về thông tin user
      const loggedInUser = await login(credentials);
      console.log("DỮ LIỆU TỪ API:", JSON.stringify(loggedInUser, null, 2)); 
      toast.success("Đăng nhập thành công!");

      // 2. Lấy đường dẫn cần chuyển hướng từ hàm helper
      const redirectPath = getRedirectPath(loggedInUser);

      // 3. Chuyển hướng và tải lại trang
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);

    } catch (err) {
      toast.error("Email/Username hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response: any) => {
    if (!response.credential) return;
    try {
      // 4. Gọi hàm loginWithGoogle từ context
      const loggedInUser = await loginWithGoogle(response.credential);
      console.log("DỮ LIỆU TỪ API:", JSON.stringify(loggedInUser, null, 2)); 
      const redirectPath = getRedirectPath(loggedInUser);

      // 3. Chuyển hướng và tải lại trang
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);

    } catch (err) {
      toast.error("Đăng nhập với Google thất bại.");
    }
  };

  useEffect(() => {
    // Logic tải Google script giữ nguyên
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "578646681210-5an53f3ktpkf8p35r5fpkb27i2piq598.apps.googleusercontent.com", 
          callback: handleGoogleLogin,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large", width: "100%" }
        );
        window.google.accounts.id.prompt();
      }
    };
    document.body.appendChild(script);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUserName">Email or Username</Label>
              <Input
                id="emailOrUserName"
                name="emailOrUserName"
                type="text"
                placeholder="Enter your email or username"
                value={credentials.emailOrUserName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="button"
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
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <a
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
              <div className="w-full flex flex-col space-y-2">
      <div id="google-signin-button" className="w-full" />
</div>


          <div className="text-center text-sm">
            Don’t have an account?{" "}
            <a
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}