import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { UserRecord, UserRole } from '../types/auth';
import { userService } from '../services/userService';
import { studentService } from '../services/studentService';
import { classService, ClassData } from '../services/classService';
import { centerService, Center } from '../services/centerService';
import { analyticsService, DashboardStats } from '../services/analyticsService';
import { reportService } from '../services/reportService';
import { UserModal, UserFormData } from './UserModal';
import { ClassModal } from './ClassModal';
import { CenterModal } from './CenterModal';
import { ClassDetailModal } from './ClassDetailModal';
import { ConfirmDialog } from './common/ConfirmDialog';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { AppHeader, Sidebar, PageContainer, PageHeader } from './layout/LayoutComponents';
import { DataTable, Pagination, EmptyState, StatCard, Badge } from './common/SharedComponents';
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

export const AdminPortal: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleLogout = useCallback(async () => {
    console.log('[Admin] Logging out...');
    try {
      await signOut();
      console.log('[Admin] SignOut completed, navigating to /');
      window.location.href = '/';
    } catch (error) {
      console.error('[Admin] Logout error:', error);
      window.location.href = '/';
    }
  }, [signOut]);

  const navItems = [
    { id: 'dashboard' as AdminTab, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users' as AdminTab, icon: Users, label: 'Users' },
    { id: 'classes' as AdminTab, icon: BookOpen, label: 'Classes' },
    { id: 'centers' as AdminTab, icon: Building2, label: 'Centers' },
    { id: 'analytics' as AdminTab, icon: BarChart3, label: 'Analytics' },
    { id: 'reports' as AdminTab, icon: FileSpreadsheet, label: 'Reports' },
    { id: 'messaging' as AdminTab, icon: Bell, label: 'Messaging' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        type="admin"
        userName={user?.user_metadata?.display_name || user?.email?.split('@')[0]}
        userEmail={user?.email}
        userAvatar={user?.user_metadata?.avatar_url}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar items={navItems} activeId={activeTab} onItemClick={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'dashboard' && <DashboardSection />}
          {activeTab === 'users' && <UsersSection />}
          {activeTab === 'classes' && <ClassesSection />}
          {activeTab === 'centers' && <CentersSection />}
          {activeTab === 'reports' && <ReportsSection />}
          {activeTab === 'messaging' && <MessagingSection />}
          {activeTab === 'analytics' && <PerformanceSection />}
        </div>
      </div>
    </div>
  );
};

const DashboardSection: React.FC = () => {
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

const UsersSection: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null as UserRecord | null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (roleFilter === UserRole.Student) {
        const result = await studentService.listStudents({
          status: statusFilter || undefined,
          search: searchTerm || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setUsers(result.students);
        setTotal(result.total);
      } else if (roleFilter === UserRole.Admin || roleFilter === UserRole.Teacher) {
        const result = await userService.listUsers({
          role: roleFilter,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setUsers(result.users);
        setTotal(result.total);
      } else {
        const [usersResult, studentsResult] = await Promise.all([
          userService.listUsers({
            status: statusFilter || undefined,
            search: searchTerm || undefined,
            page: currentPage,
            pageSize: Math.floor(PAGE_SIZE / 2),
          }),
          studentService.listStudents({
            status: statusFilter || undefined,
            search: searchTerm || undefined,
            page: currentPage,
            pageSize: Math.ceil(PAGE_SIZE / 2),
          }),
        ]);
        const combined = [...usersResult.users, ...studentsResult.students];
        combined.sort((a, b) => b.createdAt - a.createdAt);
        setUsers(combined);
        setTotal(usersResult.total + studentsResult.total);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmitUser = async (data: UserFormData) => {
    setModalLoading(true);
    try {
      if (modalMode === 'create') {
        await userService.createUser({
          email: data.email,
          password: data.password!,
          displayName: data.displayName,
          role: data.role,
        });
      } else if (editingUser) {
        await userService.updateUser(editingUser.id, {
          displayName: data.displayName,
          role: data.role,
          status: data.status,
        });
      }
      loadUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      alert(error.message || 'Failed to save user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;
    try {
      await userService.deleteUser(deleteDialog.user.id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
    setDeleteDialog({ open: false, user: null });
  };

  const handleBulkDelete = async () => {
    try {
      for (const userId of selectedUsers) {
        await userService.deleteUser(userId);
      }
      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
    setBulkDeleteDialog(false);
  };

  const handleResetPassword = async (u: UserRecord) => {
    try {
      await userService.resetPassword(u.email);
      alert(`Password reset email sent to ${u.email}`);
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    }
    setActiveMenu(null);
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    newSelected.has(userId) ? newSelected.delete(userId) : newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.size === users.length ? new Set() : new Set(users.map(u => u.id)));
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getRoleBadgeVariant = (r: UserRole): 'info' | 'success' | 'warning' => {
    if (r === UserRole.Admin) return 'info';
    if (r === UserRole.Teacher) return 'info';
    return 'success';
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'default' => {
    if (status === 'suspended') return 'warning';
    if (status === 'archived') return 'default';
    return 'success';
  };

  const columns = [
    {
      key: 'select',
      header: '',
      className: 'w-10',
      render: (u: UserRecord) => (
        <input
          type="checkbox"
          checked={selectedUsers.has(u.id)}
          onChange={() => toggleSelectUser(u.id)}
          className="rounded border-gray-300 text-indigo-600"
        />
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (u: UserRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            {u.role === UserRole.Admin ? <Shield className="w-5 h-5 text-indigo-600" /> : u.role === UserRole.Teacher ? <BookOpen className="w-5 h-5 text-indigo-600" /> : <GraduationCap className="w-5 h-5 text-indigo-600" />}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.displayName}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: UserRecord) => <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: UserRecord) => <Badge variant={getStatusBadgeVariant((u as any).status || 'active')}>{(u as any).status || 'Active'}</Badge>,
    },
    {
      key: 'created',
      header: 'Created',
      render: (u: UserRecord) => <span className="text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (u: UserRecord) => (
        <div className="relative">
          <button onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)} className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {activeMenu === u.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button onClick={() => { setEditingUser(u); setModalMode('edit'); setModalOpen(true); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit className="w-4 h-4" /> Edit</button>
                <button onClick={() => handleResetPassword(u)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Key className="w-4 h-4" /> Reset Password</button>
                <hr className="my-1" />
                <button onClick={() => { setDeleteDialog({ open: true, user: u }); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        description={`${total} total users`}
        action={
          <Button onClick={() => { setEditingUser(null); setModalMode('create'); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as UserRole | ''); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value={UserRole.Admin}>Administrators</option>
            <option value={UserRole.Teacher}>Teachers</option>
            <option value={UserRole.Student}>Students</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>

          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedUsers.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => setBulkDeleteDialog(true)} className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyMessage="No users found"
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          pageSize={PAGE_SIZE}
        />
      )}

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitUser} user={editingUser} mode={modalMode} loading={modalLoading} />
      <ConfirmDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })} onConfirm={handleDeleteUser} title="Delete User" message={`Delete "${deleteDialog.user?.displayName}"?`} confirmText="Delete" type="danger" />
      <ConfirmDialog isOpen={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)} onConfirm={handleBulkDelete} title="Delete Users" message={`Delete ${selectedUsers.size} users?`} confirmText="Delete All" type="danger" />
    </PageContainer>
  );
};

const ClassesSection: React.FC = () => {
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

const CentersSection: React.FC = () => {
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

const ReportsSection: React.FC = () => {
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

const MessagingSection: React.FC = () => {
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
        (await import('../supabase')).supabase.from('messages').select('*').eq('message_type', 'announcement').order('created_at', { ascending: false }).limit(50),
        (await import('../services/classService')).classService.listClasses({ pageSize: 100 }),
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
      const { supabase } = await import('../supabase');
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

const PerformanceSection: React.FC = () => {
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
