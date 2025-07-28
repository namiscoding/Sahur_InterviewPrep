"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Save, X, Crown, Star } from "lucide-react";
import toast from "react-hot-toast";

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
  limits?: {
    dailyQuestion: DailyLimit;
    dailySession: DailyLimit;
  };
  date?: string;
}

export default function UserProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const [originalData, setOriginalData] = useState<UpdateProfileDto>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [limitStatus, setLimitStatus] = useState<FreeLimitStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchLimitStatus();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("❌ Token không tồn tại.");
      return;
    }

    try {
      const res = await fetch("https://localhost:2004/api/user/full-profile", {
        headers: { Authorization: `Bearer ${token}` },
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
    const token = localStorage.getItem("authToken");
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

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("❌ Token không tồn tại.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://localhost:2004/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const result = await res.json();
        if (result?.error) throw new Error(result.error);
        if (result?.errors) throw new Error(Object.values(result.errors).flat().join("\n"));
        throw new Error("❌ Cập nhật thất bại.");
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

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">

          
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl font-bold mt-4">Profile Settings</h1>
          <p className="text-gray-600">View and update your personal information</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Card: Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Change your display name, username, and email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName || ""}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="userName">Username</Label>
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
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="secondary" onClick={() => navigate("/change-password")}>
                  🔐 Change Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Usage Limit */}
        {isLoadingStatus ? (
          <p className="p-4">Đang tải trạng thái sử dụng...</p>
        ) : limitStatus ? (
          !limitStatus.isFreeUser ? (
            <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Star className="h-6 w-6 text-yellow-600" /> Gói Premium
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Bạn đang sử dụng gói không giới hạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {limitStatus.date && (
                  <p className="text-sm text-gray-700">
                    Ngày hết hạn:{" "}
                    <span className="font-medium">
                      {new Date(limitStatus.date).toLocaleDateString("vi-VN")}
                    </span>
                  </p>
                )}
                <div className="mt-4 text-sm text-yellow-800">
                  Bạn có thể sử dụng không giới hạn số lượng câu hỏi và phiên luyện tập.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" /> Giới hạn hàng ngày (Tài khoản miễn phí)
                </CardTitle>
                <CardDescription>Thông tin sử dụng hàng ngày</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Practice Questions */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Câu hỏi luyện tập</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{limitStatus.limits?.dailyQuestion.used} đã sử dụng</span>
                    <span>{limitStatus.limits?.dailyQuestion.limit} tổng cộng</span>
                  </div>
                  <div className="w-full bg-yellow-100 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (limitStatus.limits?.dailyQuestion.used! / limitStatus.limits?.dailyQuestion.limit!) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  {limitStatus.limits?.dailyQuestion.reached && (
                    <p className="text-sm text-red-600 mt-2">Đã đạt giới hạn câu hỏi hôm nay</p>
                  )}
                </div>

                {/* Practice Sessions */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Phiên luyện tập</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{limitStatus.limits?.dailySession.used} đã sử dụng</span>
                    <span>{limitStatus.limits?.dailySession.limit} tổng cộng</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (limitStatus.limits?.dailySession.used! / limitStatus.limits?.dailySession.limit!) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  {limitStatus.limits?.dailySession.reached && (
                    <p className="text-sm text-red-600 mt-2">Đã đạt giới hạn phiên hôm nay</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <p className="p-4">Không thể xác định trạng thái người dùng.</p>
        )}
      </main>
    </div>
  );
}