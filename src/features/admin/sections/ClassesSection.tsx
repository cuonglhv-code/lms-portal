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



export const ClassesSection: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, class: null as ClassData | null });
  const [detailModal, setDetailModal] = useState({ open: false, classId: '', className: '' });

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await classService.listClasses({ search: searchTerm || undefined, page: currentPage, pageSize: PAGE_SIZE });
      setClasses(result.classes);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  const handleSubmitClass = async (data: any) => {
    setModalLoading(true);
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, data);
      } else {
        await classService.createClass(data);
      }
      loadClasses();
    } catch (error: any) {
      console.error('Failed to save class:', error);
      alert(error.message || 'Failed to save class');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteDialog.class) return;
    try {
      await classService.deleteClass(deleteDialog.class.id);
      loadClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
    setDeleteDialog({ open: false, class: null });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageContainer>
      <PageHeader
        title="Classes"
        description={`${total} total classes`}
        action={
          <Button onClick={() => { setEditingClass(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        }
      />

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input type="text" placeholder="Search classes..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 w-full max-w-md" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Card key={i} className="p-6 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></Card>)
        ) : classes.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-gray-500">No classes found</Card>
        ) : classes.map((c) => (
          <Card key={c.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.subject || 'No subject'}</p>
              </div>
              <Badge variant={c.status === 'active' ? 'success' : c.status === 'draft' ? 'default' : 'danger'}>{c.status}</Badge>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><span className="font-medium">Teacher:</span> {c.teacher?.display_name || 'Unassigned'}</p>
              <p><span className="font-medium">Center:</span> {(c.center as any)?.name || 'None'}</p>
              <p><span className="font-medium">Students:</span> {c.student_count || 0} / {c.max_students}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setDetailModal({ open: true, classId: c.id, className: c.name })}>
                <Calendar className="w-4 h-4 mr-1" /> Sessions
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditingClass(c); setModalOpen(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteDialog({ open: true, class: c })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          pageSize={PAGE_SIZE}
        />
      )}

      <ClassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitClass} classData={editingClass} loading={modalLoading} />
      <ClassDetailModal isOpen={detailModal.open} onClose={() => setDetailModal({ open: false, classId: '', className: '' })} classId={detailModal.classId} className={detailModal.className} />
      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, class: null })} onConfirm={handleDeleteClass} title="Delete Class" message={`Delete "${deleteDialog.class?.name}"?`} confirmText="Delete" type="danger" />
    </PageContainer>
  );
};

