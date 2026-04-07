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



export const PerformanceSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAnalytics(selectedClass);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const data = await classService.listClasses({ pageSize: 100 });
      setClasses(data.classes);
      if (data.classes.length > 0) {
        setSelectedClass(data.classes[0].id);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadAnalytics = async (classId: string) => {
    setLoading(true);
    try {
      const [analyticsData, studentsData] = await Promise.all([
        analyticsService.getClassAnalytics(classId),
        classService.getClassStudents(classId),
      ]);
      setAnalytics(analyticsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Performance metrics and insights"
        action={
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        }
      />

      {loading ? (
        <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : !analytics ? (
        <Card className="p-12 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a class to view analytics</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Students" value={analytics.totalStudents} icon={GraduationCap} color="indigo" />
            <StatCard label="Attendance Rate" value={`${analytics.averageAttendance}%`} icon={CheckCircle} color="emerald" />
            <StatCard label="Homework Completion" value={`${analytics.averageHomeworkCompletion}%`} icon={BookOpen} color="amber" />
            <StatCard label="Average Score" value={`${analytics.averageScore}%`} icon={TrendingUp} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="range"
                      label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.scoreDistribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className="text-sm font-medium">{analytics.averageAttendance}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${analytics.averageAttendance}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Homework Completion</span>
                    <span className="text-sm font-medium">{analytics.averageHomeworkCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${analytics.averageHomeworkCompletion}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-sm font-medium">{analytics.averageScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full transition-all" style={{ width: `${analytics.averageScore}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Homework</th>
                    <th className="px-4 py-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.slice(0, 10).map((s: any) => {
                    const student = s.student;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <GraduationCap className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-medium">{student?.display_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={student?.attendance_rate > 80 ? 'success' : student?.attendance_rate > 60 ? 'warning' : 'danger'}>
                            {student?.attendance_rate || 0}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={student?.homework_rate > 80 ? 'success' : student?.homework_rate > 60 ? 'warning' : 'danger'}>
                            {student?.homework_rate || 0}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {student?.trend === 'improving' ? (
                            <span className="flex items-center gap-1 text-green-600"><TrendingUp className="w-4 h-4" /> Improving</span>
                          ) : student?.trend === 'declining' ? (
                            <span className="flex items-center gap-1 text-red-600"><TrendingDown className="w-4 h-4" /> Declining</span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500"><Clock className="w-4 h-4" /> Stable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </PageContainer>
  );
};
