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
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';

// Icons
import { ArrowLeft, Search, Eye, AlertCircle, PlusCircle, Edit } from "lucide-react";

const SystemAdminUsageLimitsPage: React.FC = () => {
  const navigate = useNavigate();

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
      console.log('Fetching settings with params:', {
        prefix: undefined,
        searchTerm,
        page: settings.page,
        pageSize: settings.pageSize
      });
      
      const data = await getAllSystemSettings(
        undefined, // Không filter theo prefix, lấy tất cả system settings
        searchTerm,
        settings.page,
        settings.pageSize
      );
      
      console.log('Received settings data:', data);
      setSettings(data);
    } catch (err) {
      console.error("Error fetching system settings:", err);
      setError('Failed to fetch system settings. Please ensure the backend is running and accessible.');
      toast.error("Failed to fetch system settings. Please ensure the backend is running and accessible.");
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
      setError('Failed to fetch system setting details.');
      toast.error("Failed to fetch system setting details.");
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
  
      toast.success("System setting updated successfully.");
  
      setTimeout(() => {
        setIsDetailsOpen(false);
        fetchSettings();
      }, 1000);
    } catch (err) {
      setUpdateError('Failed to update system setting.');
      toast.error("Failed to update system setting.");
    }
  };

  const handleCreate = async () => {
    setCreateError(null);
    
    // Validation
    if (!newKey.trim()) {
      setCreateError("Setting key is required.");
      toast.error("Setting key is required.");
      return;
    }
    
    if (!createValue.trim()) {
      setCreateError("Setting value is required.");
      toast.error("Setting value is required.");
      return;
    }
    
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
      
      // Reset to first page and clear search to show new setting
      setSettings(prev => ({ ...prev, page: 1 }));
      setSearchTerm("");
      setLocalSearch("");
      
      // Force refresh the settings list
      setTimeout(async () => {
        await fetchSettings();
        // Double check to ensure the new setting appears
        console.log(`Created setting "${newKey}" - refreshing list...`);
        
        // Verify the new setting exists by trying to fetch it directly
        try {
          const newSetting = await getSystemSettingByKey(newKey);
          console.log(`Verification: Setting "${newKey}" exists with value:`, newSetting.settingValue);
        } catch (verifyErr) {
          console.error(`Verification failed: Setting "${newKey}" not found:`, verifyErr);
          toast.error(`Warning: Created setting "${newKey}" may not be visible immediately. Please refresh the page.`);
        }
      }, 100);
      
      toast.success(`System setting "${newKey}" created successfully and added to the list!`);
    } catch (err: any) {
      const message = err.message || "Failed to create system setting.";
      setCreateError(message);
      
      // Check for specific error types
      if (message.toLowerCase().includes('already exists')) {
        toast.error("A system setting with this key already exists.");
      } else {
        toast.error(message);
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(localSearch);
      if (localSearch.trim()) {
        toast.success(`Searching for: "${localSearch}"`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system settings...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">System Settings Management</h1>
                              <p className="mt-2 text-gray-600">SystemAdmin configure all system settings</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/systemadmin/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Setting
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

          <span className="text-sm font-medium text-gray-700">Total Settings: {settings.totalCount}</span>
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
                No system settings found
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
                    <Badge variant={setting.settingKey.startsWith('FREE_USER_') ? 'default' : 'secondary'} className="text-xs">
                      System Setting
                    </Badge>
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
        <div className="flex justify-center items-center space-x-4 mb-6">
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
              <span className="font-medium">{settings.totalCount}</span> system settings
            </p>
          </div>
        )}
      </main>

      {/* Details Dialog */}
      {selectedSetting && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit System Setting: {selectedSetting.settingKey}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Setting Key</Label>
                <p className="text-sm font-medium">{selectedSetting.settingKey}</p>
              </div>
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
            </div>
            {updateError && (
              <div className="flex items-center text-red-600 mt-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                {updateError}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Update Setting</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New System Setting</DialogTitle>
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
              placeholder="e.g. SYSTEM_TIMEOUT, FREE_USER_DAILY_LIMIT..."
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
              placeholder="e.g. 5, 10, 100..."
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
              placeholder="Description of this setting..."
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
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create Setting</Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
  );
};

export default SystemAdminUsageLimitsPage;