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



export const UsersSection: React.FC = () => {
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

