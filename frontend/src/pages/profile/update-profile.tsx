"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit3, Save, X, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

interface UpdateProfileDto {
  displayName?: string
  userName?: string
  email?: string
}

interface UserProfileProps {
  onNavigate: (page: string) => void
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [originalData, setOriginalData] = useState<UpdateProfileDto>({})
  const [formData, setFormData] = useState<UpdateProfileDto>({})

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setErrorMessage("❌ Token not found.")
        setShowError(true)
        return
      }

      try {
        const res = await fetch("https://localhost:2004/api/user/full-profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error("Failed to load profile.")

        const data = await res.json()
        setOriginalData(data)
        setFormData(data)
      } catch (err: any) {
        setErrorMessage(err.message || "❌ Failed to fetch user information.")
        setShowError(true)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setShowError(false)
    setShowSuccess(false)

    const token = localStorage.getItem("token")
    if (!token) {
      setErrorMessage("❌ Token not found during update.")
      setShowError(true)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("https://localhost:2004/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      let result = null
      if (res.status !== 204) {
        result = await res.json()
      }

      if (!res.ok) {
        if (result?.error) throw new Error(token)
        if (result?.errors) throw new Error(Object.values(result.errors).flat().join("\n"))
        throw new Error("❌ Update failed.")
      }

      setOriginalData(formData)
      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      setErrorMessage(error.message || "❌ An error occurred.")
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setShowError(false)
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button  size="sm" onClick={() => onNavigate("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mt-4">Profile Settings</h1>
          <p className="text-gray-600">View and update your personal information</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {showError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 whitespace-pre-line">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Change your display name, username, and email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={formData.displayName || ""}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.displayName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="userName">Username</Label>
                {isEditing ? (
                  <Input
                    id="userName"
                    value={formData.userName || ""}
                    onChange={(e) => handleInputChange("userName", e.target.value)}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">@{formData.userName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{formData.email}</p>
              )}
            </div>

            {isEditing ? (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
                  <Save className="h-4 w-4 mr-1" /> {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
