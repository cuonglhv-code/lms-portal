import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthProvider';
import { UserRecord, UserRole } from '../../../types/auth';
import { userService } from '../../../services/userService';
import { studentService } from '../../../services/studentService';
import { classService, ClassData } from '../../../services/classService';
import { centerService, Center } from '../../../services/centerService';
import { analyticsService, DashboardStats } from '../../../services/analyticsService';
import { reportService } from '../../../services/reportService';
import { UserModal, UserFormData } from '../../../components/UserModal';
import { ClassModal } from '../../../components/ClassModal';
import { CenterModal } from '../../../components/CenterModal';
import { ClassDetailModal } from '../../../components/ClassDetailModal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { AppHeader, Sidebar, PageContainer, PageHeader } from '../../../components/layout/LayoutComponents';
import { DataTable, Pagination, EmptyState, StatCard, Badge } from '../../../components/common/SharedComponents';
import {
  Users,
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Building2,
  BookOpen,
  GraduationCap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  FileSpreadsheet,
  Bell,
  RefreshCw,
  CheckCircle,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

type AdminTab = 'dashboard' | 'users' | 'classes' | 'centers' | 'reports' | 'messaging' | 'analytics';

const PAGE_SIZE = 15;



export const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your education platform"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Students"
          value={loading ? '...' : (stats?.totalStudents || 0)}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          label="Total Teachers"
          value={loading ? '...' : (stats?.totalTeachers || 0)}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Total Classes"
          value={loading ? '...' : (stats?.totalClasses || 0)}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          label="Total Centers"
          value={loading ? '...' : (stats?.totalCenters || 0)}
          icon={Building2}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Students This Month</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-indigo-600">
              {loading ? '...' : stats?.newStudentsThisMonth || 0}
            </div>
            {!loading && stats && (
              <span className={`text-sm font-medium ${stats.newStudentsTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats.newStudentsTrend >= 0 ? '+' : ''}{stats.newStudentsTrend}% vs last month
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Attendance Rate</span>
              <span className="font-medium text-gray-900">{loading ? '...' : `${stats?.attendanceRate || 0}%`}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats?.attendanceRate || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">Homework Completion</span>
              <span className="font-medium text-gray-900">{loading ? '...' : `${stats?.homeworkCompletionRate || 0}%`}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${stats?.homeworkCompletionRate || 0}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

