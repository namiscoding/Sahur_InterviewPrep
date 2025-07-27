import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield, Settings, Database, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { getSystemAdminDashboardStats, type SystemAdminStats } from '../../services/systemAdminDashboardService';
import { toast } from 'react-hot-toast';

const SystemAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemAdminStats>({
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalRevenue: 0,
    totalUserAdmins: 0,
    activeUserAdmins: 0,

    systemSettings: 0,
    transactionsToday: 0,
    revenueToday: 0,
    avgTransactionValue: 0,
    transactionStatusDistribution: {
      completedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      completedPercentage: 0,
      pendingPercentage: 0,
      failedPercentage: 0,
    },
    userAdminStatusDistribution: {
      activeCount: 0,
      inactiveCount: 0,
      activePercentage: 0,
      inactivePercentage: 0,
    },
    revenueByCurrency: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemAdminDashboardStats();
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

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      description: "All customer transactions",
      icon: CreditCard,
      color: "bg-blue-500",
      change: (stats as any).changes?.transactions?.change || '',
      changeType: (stats as any).changes?.transactions?.changeType || 'neutral',
    },
    {
      title: "Total Revenue",
      value: formatVND(stats.totalRevenue),
      description: "Total system revenue",
      icon: DollarSign,
      color: "bg-green-500",
      change: (stats as any).changes?.revenue?.change || '',
      changeType: (stats as any).changes?.revenue?.changeType || 'neutral',
    },
    {
      title: "UserAdmin Accounts",
      value: stats.totalUserAdmins,
      description: "Active admin accounts",
      icon: Shield,
      color: "bg-purple-500",
      change: (stats as any).changes?.userAdmins?.change || '',
      changeType: (stats as any).changes?.userAdmins?.changeType || 'neutral',
    },
    {
      title: "Today's Transactions",
      value: stats.transactionsToday,
      description: "Transactions processed today",
      icon: TrendingUp,
      color: "bg-cyan-500",
      change: (stats as any).changes?.completedTransactions?.change || '',
      changeType: (stats as any).changes?.completedTransactions?.changeType || 'neutral',
    },
    {
      title: "Total Settings",
      value: stats.systemSettings,
      description: "All system configurations",
      icon: Database,
      color: "bg-indigo-500",
      change: (stats as any).changes?.systemSettings?.change || '',
      changeType: (stats as any).changes?.systemSettings?.changeType || 'neutral',
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
          <h1 className="text-3xl font-bold text-gray-900">SystemAdmin Dashboard</h1>
          <p className="text-gray-600 mt-2">System-wide management and monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Database className="w-3 h-3 mr-1" />
            System Overview
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
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
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
              <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
              Transaction Status Distribution
            </CardTitle>
            <CardDescription>Current status of all transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.transactionStatusDistribution.completedPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.completedTransactions}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${stats.transactionStatusDistribution.pendingPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.pendingTransactions}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${stats.transactionStatusDistribution.failedPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.failedTransactions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-500" />
              Admin Account Status
            </CardTitle>
            <CardDescription>UserAdmin account management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active UserAdmins</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.userAdminStatusDistribution.activePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.activeUserAdmins}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inactive UserAdmins</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${stats.userAdminStatusDistribution.inactivePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.userAdminStatusDistribution.inactiveCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Today's Revenue
            </CardTitle>
            <CardDescription>Revenue generated today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatVND(stats.revenueToday)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {stats.transactionsToday} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Avg Transaction Value
            </CardTitle>
            <CardDescription>Average transaction amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatVND(stats.avgTransactionValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">All Systems Operational</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Last checked: Just now
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminDashboard; 