import React, { useEffect, useState } from 'react';
import {
  getAllSystemSettings,
  getSystemSettingByKey,
  createSystemSetting,
  updateSystemSetting,
  PagedResult,
  SystemSettingDTO,
  CreateSystemSettingDTO,
  UpdateSystemSettingDTO,
} from '../../services/systemSettingService';

// Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Icons
import { ArrowLeft, Search, Eye, AlertCircle, PlusCircle, Edit } from "lucide-react";

const SystemAdminUsageLimitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState<PagedResult<SystemSettingDTO>>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSetting, setSelectedSetting] = useState<SystemSettingDTO | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [createValue, setCreateValue] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAllSystemSettings(
        "FREE_USER_",
        searchTerm,
        settings.page,
        settings.pageSize
      );
      setSettings(data);
    } catch (err) {
      console.error("Error fetching system settings:", err);
      setError('Failed to fetch usage limits. Please ensure the backend is running and accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [searchTerm, settings.page]);

  const handleViewDetails = async (key: string) => {
    try {
      const details = await getSystemSettingByKey(key);
      setSelectedSetting(details);
      setNewValue(details.settingValue);
      setNewDescription(details.description || "");
      setIsDetailsOpen(true);
    } catch (err) {
      setError('Failed to fetch usage limit details.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSetting) return;
    setUpdateError(null);
    try {
      const dto: UpdateSystemSettingDTO = { 
        settingValue: newValue,
        description: newDescription 
      };
      const updated = await updateSystemSetting(selectedSetting.settingKey, dto);
      setSelectedSetting(updated);
  
      toast({
        title: "Success",
        description: "Usage limit updated successfully.",
        duration: 2000,
      });
  
      setTimeout(() => {
        setIsDetailsOpen(false);
        fetchSettings();
      }, 1000);
    } catch (err) {
      setUpdateError('Failed to update usage limit.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update usage limit.",
        duration: 2000,
      });
    }
  };

  const handleCreate = async () => {
    setCreateError(null);
    try {
      const dto: CreateSystemSettingDTO = {
        settingKey: newKey,
        settingValue: createValue,
        description: createDescription
      };
      await createSystemSetting(dto);
      setIsCreateOpen(false);
      setNewKey("");
      setCreateValue("");
      setCreateDescription("");
      fetchSettings();
      toast({
        title: "Success",
        description: "Usage limit created successfully.",
        duration: 4000,
      });
    } catch (err: any) {
      const message = err.message || "Failed to create usage limit.";
      setCreateError(message);
    
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
        duration: 4000,
      });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearch);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading usage limits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button onClick={fetchSettings}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usage Limits Management</h1>
              <p className="mt-2 text-gray-600">SystemAdmin configure usage limits for free accounts</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Limit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by key or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
            />
          </div>

          <span className="text-sm font-medium text-gray-700">Total Limits: {settings.totalCount}</span>
        </div>

        {/* Settings Cards */}
        {settings.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2v.01M12 18v.01m-4.36-7.43l.01 0c.22-.22.53-.35.86-.35h6.98c.33 0 .64.13.86.35l.01 0m-8.72 0h8.72m-4.36 7.07l.01 0c.22.22.53.35.86.35h0c.33 0 .64-.13.86-.35l.01 0" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                No usage limits found
              </p>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or create a new one
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {settings.items.map((setting) => (
              <Card key={setting.settingKey} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{setting.settingKey}</CardTitle>
                      <CardDescription className="mt-1">Value: {setting.settingValue}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Description: {setting.description || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Updated: {new Date(setting.updatedAt).toLocaleString()}</p>
                  <div className="flex justify-end mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(setting.settingKey)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={settings.page === 1}
            onClick={() => setSettings(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span>Page {settings.page} of {Math.ceil(settings.totalCount / settings.pageSize)}</span>
          <Button
            variant="outline"
            disabled={settings.page * settings.pageSize >= settings.totalCount}
            onClick={() => setSettings(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>

        {/* Results Summary */}
        {settings.items.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-4">
            <p>
              Showing <span className="font-medium">{settings.items.length}</span> of{" "}
              <span className="font-medium">{settings.totalCount}</span> usage limits
            </p>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearch("");
                  setSearchTerm("");
                }}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {selectedSetting && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Usage Limit: {selectedSetting.settingKey}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <p className="text-sm text-gray-600">Updated At: {new Date(selectedSetting.updatedAt).toLocaleString()}</p>
            </div>
            {updateError && (
              <div className="flex items-center text-red-600 mt-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                {updateError}
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Usage Limit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                Key
              </Label>
              <Input
                id="key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="col-span-3"
                placeholder="FREE_USER_..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createValue" className="text-right">
                Value
              </Label>
              <Input
                id="createValue"
                type="number"
                value={createValue}
                onChange={(e) => setCreateValue(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createDescription" className="text-right">
                Description
              </Label>
              <Input
                id="createDescription"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          {createError && (
            <div className="flex items-center text-red-600 mt-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              {createError}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAdminUsageLimitsPage;