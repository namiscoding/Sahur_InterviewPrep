"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Save, X, ArrowLeft, Crown, LogOut, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

interface UpdateProfileDto {
  displayName?: string;
  userName?: string;
  email?: string;
}

interface DailyLimit {
  used: number;
  limit: number;
  reached: boolean;
}

interface FreeLimitStatus {
  isFreeUser: boolean;
  limits: {
    dailyQuestion: DailyLimit;
    dailySession: DailyLimit;
  };
}

interface SubscriptionStatus {
  isActive: boolean;
  planType: string;
  startDate: string;
  endDate: string;
  features: string[];
}

export function UserProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const [originalData, setOriginalData] = useState<UpdateProfileDto>({});
  const [limitStatus, setLimitStatus] = useState<FreeLimitStatus | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchLimitStatus();
    fetchSubscriptionStatus();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("❌ Token không tồn tại.");

    try {
      const res = await fetch("https://localhost:2004/api/user/full-profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("❌ Không thể lấy thông tin người dùng.");

      const data = await res.json();
      setOriginalData(data);
      setFormData(data);
    } catch (err: any) {
      toast.error(err.message || "❌ Lỗi khi tải thông tin người dùng.");
    }
  };

  const fetchLimitStatus = async () => {
    setIsLoadingStatus(true);
    const token = localStorage.getItem("token");
    if (!token) return setIsLoadingStatus(false);

    try {
      const res = await fetch("https://localhost:2004/api/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("❌ Không thể lấy giới hạn sử dụng.");

      const data = await res.json();
      setLimitStatus(data);
    } catch (err: any) {
      toast.error(err.message || "❌ Lỗi khi tải giới hạn sử dụng.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    setIsLoadingSubscription(true);
    const token = localStorage.getItem("token");
    if (!token) return setIsLoadingSubscription(false);

    try {
      const res = await fetch("https://localhost:2004/api/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("❌ Không thể lấy thông tin gói premium.");

      const data = await res.json();
      setSubscriptionStatus(data);
    } catch (err: any) {
      console.log("Subscription status error:", err);
      // Không hiển thị toast error vì có thể user chưa có gói premium
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return toast.error("❌ Token không tồn tại.");

    try {
      const res = await fetch("https://localhost:2004/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result?.error || Object.values(result?.errors || {}).flat().join("\n") || "❌ Cập nhật thất bại.");
      }

      setOriginalData(formData);
      setIsEditing(false);
      toast.success("✅ Cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error(err.message || "❌ Có lỗi xảy ra khi cập nhật.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("https://localhost:2004/api/user/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      localStorage.removeItem("token");
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      toast.error("❌ Lỗi khi đăng xuất.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/questions")}> <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Trang chủ </Button>
          <h1 className="text-3xl font-bold mt-4">Cài đặt Hồ sơ</h1>
          <p className="text-gray-600">Xem và cập nhật thông tin cá nhân của bạn</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Premium Subscription Status */}
        {subscriptionStatus && subscriptionStatus.isActive && (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Star className="h-6 w-6 text-yellow-600" /> Gói Premium
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Bạn đang sử dụng gói {subscriptionStatus.planType}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày bắt đầu:</span>
                  <span className="font-medium">{new Date(subscriptionStatus.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày kết thúc:</span>
                  <span className="font-medium">{new Date(subscriptionStatus.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tính năng Premium:</h4>
                  <div className="flex flex-wrap gap-2">
                    {subscriptionStatus.features?.map((feature, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <Zap className="h-3 w-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Limits Card - Only show for free users */}
        {(!subscriptionStatus || !subscriptionStatus.isActive) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" /> Giới hạn hàng ngày (Tài khoản miễn phí)
              </CardTitle>
              <CardDescription>Thông tin sử dụng hàng ngày</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <p>Đang tải giới hạn...</p>
              ) : limitStatus && limitStatus.isFreeUser ? (
                <>
                  {/* Practice Questions */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Câu hỏi luyện tập</p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{limitStatus.limits.dailyQuestion.used} đã sử dụng</span>
                      <span>{limitStatus.limits.dailyQuestion.limit} tổng cộng</span>
                    </div>
                    <div className="w-full bg-yellow-100 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (limitStatus.limits.dailyQuestion.used /
                              limitStatus.limits.dailyQuestion.limit) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    {limitStatus.limits.dailyQuestion.reached && (
                      <p className="text-sm text-red-600 mt-2">Đã đạt giới hạn câu hỏi hàng ngày</p>
                    )}
                  </div>

                  {/* Practice Sessions */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Phiên luyện tập</p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{limitStatus.limits.dailySession.used} đã sử dụng</span>
                      <span>{limitStatus.limits.dailySession.limit} tổng cộng</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (limitStatus.limits.dailySession.used /
                              limitStatus.limits.dailySession.limit) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    {limitStatus.limits.dailySession.reached && (
                      <p className="text-sm text-red-600 mt-2">Đã đạt giới hạn phiên hàng ngày</p>
                    )}
                  </div>
                </>
              ) : (
                <p>Tài khoản của bạn không có giới hạn.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Thay đổi tên hiển thị, tên người dùng và email của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="displayName">Tên hiển thị</Label>
                <Input
                  id="displayName"
                  value={formData.displayName || ""}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="userName">Tên người dùng</Label>
                <Input
                  id="userName"
                  value={formData.userName || ""}
                  onChange={(e) => handleInputChange("userName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                readOnly
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4 mr-1" /> Hủy
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
                  <Save className="h-4 w-4 mr-1" /> {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Chỉnh sửa
                </Button>
                <Button variant="secondary" onClick={() => navigate("/change-password")}>🔐 Đổi mật khẩu</Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Đăng xuất
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
