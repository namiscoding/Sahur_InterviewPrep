// ================= React Component =================
"use client";

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSessions: number;
  activeSessions: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
  revenueByMonth: MonthlyRevenue[];
}

const RevenueChart: React.FC = () => {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      const response = await fetch('https://localhost:2004/api/system-stats');
      if (!response.ok) throw new Error('Failed to fetch');
      const systemStats: SystemStats = await response.json();
      setData(systemStats.revenueByMonth);
      setStats(systemStats);
    } catch (error) {
      console.error('Failed to fetch revenue data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.totalUsers}</CardContent>
        </Card>
     
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</CardContent>
        </Card>
   
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.totalSessions}</CardContent>
        </Card>
    
     
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.revenueGrowthRate.toFixed(2)}%</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Chart</CardTitle>
          <CardDescription>Revenue performance over recent months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueChart;
