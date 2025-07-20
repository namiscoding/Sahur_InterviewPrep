import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import {
    SubscriptionPlan,
    UpdateSubscriptionPlanInfoDTO,
    UpdateSubscriptionPlanStatusDTO,
    mapSubscriptionLevelText,
    subscriptionService 
} from '../../services/subscriptionService';
// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// Icons
import { PlusCircle, Edit, RefreshCw, ArrowLeft } from "lucide-react";


// Separate Form Component (can be placed in src/components/SubscriptionPlanForm.tsx)
interface SubscriptionPlanFormProps {
    onSave: (data: UpdateSubscriptionPlanInfoDTO) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    initialData?: SubscriptionPlan | null; // Used for both add and edit
}

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({ onSave, onCancel, isSubmitting, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [level, setLevel] = useState<number>(initialData?.level || 0); // Enum value
    const [durationMonths, setDurationMonths] = useState(initialData?.durationMonths || 1);
    const [price, setPrice] = useState(initialData?.price || 0.01);
    const [currency, setCurrency] = useState(initialData?.currency || 'USD');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!name || !currency || durationMonths <= 0 || price <= 0) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        const data: UpdateSubscriptionPlanInfoDTO = { // Using Update DTO as it contains the fields to be edited
            name,
            level,
            durationMonths,
            price,
            currency
        };
        onSave(data);
    };

    return (
        <Card className="p-6">
            <CardHeader className="p-0 mb-4">
                <CardTitle>{initialData ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</CardTitle>
                <CardDescription>
                    {initialData ? 'Update detailed information for the subscription plan.' : 'Add a new subscription plan to the system.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="planName">Plan Name</Label>
                        <Input
                            id="planName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="planLevel">Level</Label>
                        <Select
                            value={level.toString()}
                            onValueChange={(val) => setLevel(parseInt(val))}
                            required
                        >
                            <SelectTrigger id="planLevel">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Free</SelectItem>
                                <SelectItem value="2">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="planDurationMonths">Duration (Months)</Label>
                        <Input
                            id="planDurationMonths"
                            type="number"
                            value={durationMonths}
                            onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="planPrice">Price</Label>
                        <Input
                            id="planPrice"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value) || 0.01)}
                            required
                            min="0.01"
                        />
                    </div>
                    <div>
                        <Label htmlFor="planCurrency">Currency</Label>
                        <Input
                            id="planCurrency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            required
                            maxLength={3}
                            minLength={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Plan')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};


const SubscriptionPlanManagementPage: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [showFormDialog, setShowFormDialog] = useState<boolean>(false);

    // State for toggle status
    const [statusToggleLoadingId, setStatusToggleLoadingId] = useState<number | null>(null);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fixed: Use subscriptionService.getSubscriptionPlans instead of getSubscriptionPlans
            const data = await subscriptionService.getSubscriptionPlans();
            setPlans(data);
            console.log('Fetched subscription plans:', data);
        } catch (err: any) {
            console.error("Error fetching subscription plans:", err);
            setError(err.message || 'Failed to fetch subscription plans. Please ensure the backend is running and accessible.');
            toast.error(err.message || 'Unable to load subscription plans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreateOrUpdatePlan = async (data: UpdateSubscriptionPlanInfoDTO) => {
        setIsSubmittingForm(true);
        try {
            if (editingPlan) {
                // Update existing plan
                // Fixed: Use subscriptionService.updateSubscriptionPlanInfo instead of updateSubscriptionPlanInfo
                const updated = await subscriptionService.updateSubscriptionPlanInfo(editingPlan.id, data);
                setPlans(prev => prev.map(plan => plan.id === editingPlan.id ? updated : plan));
                toast.success(`Plan "${updated.name}" updated successfully!`);
            } else {
                // Create new plan (If you implement create API in backend and service)
                // This is commented out as create API for SubscriptionPlan was not explicitly requested earlier
                // const created = await subscriptionService.createSubscriptionPlan(data); 
                // setPlans(prev => [...prev, created]);
                // toast.success(`Plan "${created.name}" created successfully!`);
                toast.error("New plan creation feature is not fully implemented yet."); // Remove this line if create is implemented
                return; // Exit if creation is not fully supported by backend
            }
            setShowFormDialog(false);
            setEditingPlan(null);
        } catch (error: any) {
            console.error('Error saving plan:', error);
            toast.error(error.message || `Error ${editingPlan ? 'updating' : 'creating'} plan. Please check again.`);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const handleToggleStatus = async (plan: SubscriptionPlan) => {
        setStatusToggleLoadingId(plan.id);
        try {
            const statusDto: UpdateSubscriptionPlanStatusDTO = {
                isActive: !plan.isActive
            };
            
            // Fixed: Use subscriptionService.updateSubscriptionPlanStatus instead of updateSubscriptionPlanStatus
            const updatedPlan = await subscriptionService.updateSubscriptionPlanStatus(plan.id, statusDto);
            setPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
            
            const statusText = updatedPlan.isActive ? 'activated' : 'deactivated';
            toast.success(`Plan "${updatedPlan.name}" has been ${statusText} successfully!`);
        } catch (error: any) {
            console.error('Error toggling plan status:', error);
            toast.error(error.message || 'Error updating plan status.');
        } finally {
            setStatusToggleLoadingId(null);
        }
    };

    const handleEditPlan = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setShowFormDialog(true);
    };

    const handleCloseFormDialog = () => {
        setShowFormDialog(false);
        setEditingPlan(null); // Reset editing state
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading subscription plans...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-semibold">Error Loading Subscription Plans</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <div className="space-x-2">
                        <Button onClick={fetchPlans}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Link to="/">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
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
                            <h1 className="text-3xl font-bold text-gray-900">Subscription Plan Management</h1>
                            <p className="mt-2 text-gray-600">
                                Manage subscription plans that users can purchase.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Total plans: {plans.length}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={fetchPlans}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            <Link to="/">
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            {/* "New Plan" button is commented out because the create new feature is not fully implemented in the backend */}
                            {/* <Button onClick={() => setShowFormDialog(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Plan
                            </Button> */}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Plans Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plans List</CardTitle>
                        <CardDescription>View and manage subscription plans.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID</th>
                                        <th scope="col" className="px-6 py-3">Plan Name</th>
                                        <th scope="col" className="px-6 py-3">Level</th>
                                        <th scope="col" className="px-6 py-3">Duration (Months)</th>
                                        <th scope="col" className="px-6 py-3">Price</th>
                                        <th scope="col" className="px-6 py-3">Currency</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center">
                                                No subscription plans found.
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan) => (
                                            <tr key={plan.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{plan.id}</td>
                                                <td className="px-6 py-4">{plan.name}</td>
                                                <td className="px-6 py-4">{mapSubscriptionLevelText(plan.level)}</td>
                                                <td className="px-6 py-4">{plan.durationMonths}</td>
                                                <td className="px-6 py-4">{plan.price.toFixed(2)}</td>
                                                <td className="px-6 py-4">{plan.currency}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={plan.isActive}
                                                            onCheckedChange={() => handleToggleStatus(plan)}
                                                            disabled={statusToggleLoadingId === plan.id}
                                                        />
                                                        <Badge className={getStatusColor(plan.isActive)}>
                                                            {statusToggleLoadingId === plan.id ? 'Updating...' : (plan.isActive ? 'Active' : 'Inactive')}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditPlan(plan)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Form Dialog (for Create/Edit) */}
            <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</DialogTitle>
                        <DialogDescription>
                            {editingPlan ? 'Update detailed information for the subscription plan.' : 'Add a new subscription plan to the system.'}
                        </DialogDescription>
                    </DialogHeader>
                    <SubscriptionPlanForm
                        onSave={handleCreateOrUpdatePlan}
                        onCancel={handleCloseFormDialog}
                        isSubmitting={isSubmittingForm}
                        initialData={editingPlan}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubscriptionPlanManagementPage;