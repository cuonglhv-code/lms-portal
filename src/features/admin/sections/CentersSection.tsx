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



export const CentersSection: React.FC = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, center: null as Center | null });

  const loadCenters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await centerService.listCenters();
      setCenters(data);
    } catch (error) {
      console.error('Failed to load centers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCenters(); }, [loadCenters]);

  const handleSubmitCenter = async (data: any) => {
    setModalLoading(true);
    try {
      if (editingCenter) {
        await centerService.updateCenter(editingCenter.id, data);
      } else {
        await centerService.createCenter(data);
      }
      loadCenters();
    } catch (error: any) {
      console.error('Failed to save center:', error);
      alert(error.message || 'Failed to save center');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCenter = async () => {
    if (!deleteDialog.center) return;
    try {
      await centerService.deleteCenter(deleteDialog.center.id);
      loadCenters();
    } catch (error) {
      console.error('Failed to delete center:', error);
    }
    setDeleteDialog({ open: false, center: null });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Centers"
        description={`${centers.length} centers`}
        action={
          <Button onClick={() => { setEditingCenter(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Card key={i} className="p-6 animate-pulse"><div className="h-32 bg-gray-200 rounded"></div></Card>)
        ) : centers.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-gray-500">No centers found</Card>
        ) : centers.map((c) => (
          <Card key={c.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.name}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {c.address && <p>{c.address}</p>}
              {c.phone && <p>{c.phone}</p>}
              {c.email && <p>{c.email}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingCenter(c); setModalOpen(true); }}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteDialog({ open: true, center: c })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <CenterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitCenter} center={editingCenter} loading={modalLoading} />
      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, center: null })} onConfirm={handleDeleteCenter} title="Delete Center" message={`Delete "${deleteDialog.center?.name}"?`} confirmText="Delete" type="danger" />
    </PageContainer>
  );
};

