"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Save, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface UpdateProfileDto {
  displayName?: string;
  userName?: string;
  email?: string;
}

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const [originalData, setOriginalData] = useState<UpdateProfileDto>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Token không tồn tại.");
        return;
      }

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

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
          <Button variant="ghost" onClick={() => onNavigate("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl font-bold mt-4">Profile Settings</h1>
          <p className="text-gray-600">View and update your personal information</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
                <Button variant="secondary" onClick={() => onNavigate("change-password")}>
                  🔐 Change Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
