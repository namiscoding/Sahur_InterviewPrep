"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";

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
  const [limitStatus, setLimitStatus] = useState<FreeLimitStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    fetchLimitStatus();
  }, []);

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

  if (isLoadingStatus) return <p className="p-4">Đang tải trạng thái sử dụng...</p>;

  if (!limitStatus) return <p className="p-4">Không thể xác định trạng thái người dùng.</p>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Premium User Card */}
      {!limitStatus.isFreeUser ? (
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
        // Free User Limits
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
      )}
    </main>
  );
}
