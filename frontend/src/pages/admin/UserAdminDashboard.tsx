import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Activity, TrendingUp, Eye } from 'lucide-react';
import { getUserAdminDashboardStats, type UserAdminStats } from '../../services/userAdminDashboardService';
import { toast } from 'react-hot-toast';

const UserAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserAdminStats>({
    totalAccounts: 0,
    totalCustomers: 0,
    totalStaff: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    premiumCustomers: 0,
    freeCustomers: 0,
    accountStatusDistribution: {
      activeCount: 0,
      inactiveCount: 0,
      activePercentage: 0,
      inactivePercentage: 0,
    },
    subscriptionDistribution: {
      premiumCount: 0,
      freeCount: 0,
      premiumPercentage: 0,
      freePercentage: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserAdminDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      description: "All user accounts in system",
      icon: Users,
      color: "bg-blue-500",
      change: (stats as any).changes?.totalAccounts?.change || '',
      changeType: (stats as any).changes?.totalAccounts?.changeType || 'neutral',
    },
    {
      title: "Customer Accounts",
      value: stats.totalCustomers,
      description: "Active customer accounts",
      icon: Users,
      color: "bg-green-500",
      change: (stats as any).changes?.customers?.change || '',
      changeType: (stats as any).changes?.customers?.changeType || 'neutral',
    },
    {
      title: "Staff Accounts",
      value: stats.totalStaff,
      description: "Staff member accounts",
      icon: UserCheck,
      color: "bg-purple-500",
      change: (stats as any).changes?.staff?.change || '',
      changeType: (stats as any).changes?.staff?.changeType || 'neutral',
    },
    {
      title: "Active Accounts",
      value: stats.activeAccounts,
      description: "Currently active users",
      icon: Activity,
      color: "bg-emerald-500",
      change: (stats as any).changes?.activeAccounts?.change || '',
      changeType: (stats as any).changes?.activeAccounts?.changeType || 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">UserAdmin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage customers and staff accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">{card.description}</p>
                  {card.change && card.changeType !== 'neutral' && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        card.changeType === 'positive' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {card.change}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Account Status Distribution
            </CardTitle>
            <CardDescription>Current status of all accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Accounts</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.accountStatusDistribution.activePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.activeAccounts}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive Accounts</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${stats.accountStatusDistribution.inactivePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.inactiveAccounts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              Customer Subscription Types
            </CardTitle>
            <CardDescription>Premium vs Free customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Customers</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${stats.subscriptionDistribution.premiumPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.premiumCustomers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Free Customers</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats.subscriptionDistribution.freePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.freeCustomers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAdminDashboard; 