"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode"
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
import type { Page } from "@/types";

interface LoginFormProps {
  onLogin: () => void;
  onNavigate: (page: Page) => void;
}

export function LoginForm({ onLogin, onNavigate }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrUserName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("https://localhost:2004/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      // xử lý lỗi...
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 👉 Decode token để lấy role
const decoded: any = jwtDecode(data.token);
const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // 👉 Điều hướng theo role
    if (role === "Admin") {
      onNavigate("categories"); // hoặc dashboard admin
    } else if (role === "User") {
      onNavigate("home");
    } else {
      onNavigate("home"); // fallback
    }

  } catch (err) {
    setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
  } finally {
    setLoading(false);
  }
};

  const autofillDemo = () => {
    setCredentials({
      emailOrUserName: "admin@example.com",
      password: "admin123",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access Mock Interview Practice
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                  Remember me
                </Label>
              </div>
              <a
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center whitespace-pre-line">
                {error}
              </p>
            )}

      
          </form>

          <div className="text-center text-sm">
            Don’t have an account?{" "}
            <a
              onClick={() => onNavigate("register")}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
