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



export const MessagingSection: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', targetType: 'all', classId: '' });
  const [classes, setClasses] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, classData] = await Promise.all([
        (await import('../../../supabase')).supabase.from('messages').select('*').eq('message_type', 'announcement').order('created_at', { ascending: false }).limit(50),
        (await import('../../../services/classService')).classService.listClasses({ pageSize: 100 }),
      ]);
      setAnnouncements(annData.data || []);
      setClasses(classData.classes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { supabase } = await import('../../../supabase');
      await supabase.from('messages').insert({
        sender_id: user?.id,
        sender_type: 'user',
        recipient_id: formData.targetType === 'all' ? 'all' : formData.classId,
        recipient_type: formData.targetType,
        title: formData.title,
        content: formData.content,
        message_type: 'announcement',
      });
      setShowForm(false);
      setFormData({ title: '', content: '', targetType: 'all', classId: '' });
      loadData();
    } catch (error) {
      console.error('Failed to send announcement:', error);
      alert('Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Messaging"
        description="Send announcements to students"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        }
      />

      {showForm ? (
        <Card className="p-6 mb-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Announcement</h3>
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement title" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement content..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value, classId: '' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Students</option>
                <option value="class">Specific Class</option>
              </select>
            </div>
            {formData.targetType === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button type="submit" loading={sending} className="flex-1">Send Announcement</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : announcements.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No announcements yet</p>
          </Card>
        ) : announcements.map((a) => (
          <Card key={a.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{a.title || 'Announcement'}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {a.recipient_type === 'all' ? 'All Students' : 'Class'} - {new Date(a.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{a.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

