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



export const ReportsSection: React.FC = () => {
  const [reportType, setReportType] = useState<'students' | 'classes' | 'attendance' | 'homework' | 'exams'>('students');
  const [reportFormat, setReportFormat] = useState<'csv' | 'json'>('csv');
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const content = await reportService.generateReport({ type: reportType, format: reportFormat });
      const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${reportFormat}`;
      const mimeType = reportFormat === 'csv' ? 'text/csv' : 'application/json';
      reportService.downloadReport(content, filename, mimeType);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    { id: 'students', label: 'Students', icon: GraduationCap, description: 'All student records with enrollment info' },
    { id: 'classes', label: 'Classes', icon: BookOpen, description: 'Class details with teachers and capacity' },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle, description: 'Attendance records by date' },
    { id: 'homework', label: 'Homework', icon: FileSpreadsheet, description: 'Homework submissions and grades' },
    { id: 'exams', label: 'Exams', icon: TrendingUp, description: 'Exam scores and grades' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="Generate and export data reports"
      />

      <div className="max-w-3xl">
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setReportType(id as any)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${reportType === id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${reportType === id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <p className="text-sm text-gray-500">{description}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setReportFormat('csv')}
              className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${reportFormat === 'csv' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              CSV (Excel Compatible)
            </button>
            <button
              onClick={() => setReportFormat('json')}
              className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${reportFormat === 'json' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              JSON
            </button>
          </div>
        </Card>

        <Button onClick={generateReport} disabled={generating} className="text-lg px-8 py-4">
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Generate & Download
            </>
          )}
        </Button>
      </div>
    </PageContainer>
  );
};

