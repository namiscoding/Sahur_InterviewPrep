"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

declare global {
  interface Window {
    google: any;
  }
}

export function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrUserName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://localhost:2004/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.error ||
          (data?.errors
            ? Object.values(data.errors).flat().join("\n")
            : "Invalid username or password.");
        toast.error(message);
        return;
      }

      handleLoginSuccess(data.token, data.user);
    } catch (err) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xử lý Google login
  const handleGoogleLogin = async (response: any) => {
    if (!response.credential) return;
  
    try {
      const res = await fetch("https://localhost:2004/api/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
  
      if (!res.ok) {
        toast.error(data?.message || "Google login failed");
        return;
      }
  
      handleLoginSuccess(data.token, data.user);
    } catch (err) {
      toast.error("Google login error");
    }
  };
  

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const decoded: any = jwtDecode(token);
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    toast.success("Login successful!");

    if (role === "Admin") navigate("/categories")
      else if (role==="User") navigate("/questions")
    else navigate("/");
  };

  useEffect(() => {
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
  
        // Gắn vào div bạn tạo để Google render đúng nút chuẩn
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
  
        // Tuỳ chọn: Hiển thị tự động nếu người dùng đã đăng nhập trước
        window.google.accounts.id.prompt();
        setGoogleScriptLoaded(true);
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
