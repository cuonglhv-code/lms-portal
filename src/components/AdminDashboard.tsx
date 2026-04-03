import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { UserRecord, UserRole } from '../types/auth';
import { userService } from '../services/userService';
import { getRoleLabel, getRoleColor, hasPermission } from '../utils/permissions';
import { UserModal, UserFormData } from './UserModal';
import { ConfirmDialog } from './common/ConfirmDialog';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { 
  Users, 
  Shield, 
  LogOut, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  UserX,
  UserCheck,
  Download,
  Mail,
  Building2,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const PAGE_SIZE = 15;

export const AdminDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

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
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserRecord | null }>({
    open: false,
    user: null,
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.listUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      });
      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, currentPage]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogout = async () => {
    await useAuth().signOut();
    navigate('/');
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditUser = (u: UserRecord) => {
    setEditingUser(u);
    setModalMode('edit');
    setModalOpen(true);
    setActiveMenu(null);
  };

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
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.message || 'Failed to delete user');
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
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-600">
            <Shield className="w-8 h-8" />
            <span className="text-xl font-black tracking-tight">Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-700">
            <Users className="w-5 h-5" />
            User Management
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">{total} total users</p>
            </div>
            <Button onClick={handleCreateUser} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole | '');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">All Roles</option>
                <option value={UserRole.Admin}>Administrators</option>
                <option value={UserRole.Teacher}>Teachers</option>
                <option value={UserRole.Student}>Students</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>

              {selectedUsers.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {selectedUsers.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDeleteDialog(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const colors = getRoleColor(u.role);
                      const statusColor = (u as any).status === 'suspended' 
                        ? 'bg-amber-100 text-amber-700'
                        : (u as any).status === 'archived'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-700';
                      const statusLabel = (u as any).status === 'suspended' 
                        ? 'Suspended'
                        : (u as any).status === 'archived'
                        ? 'Archived'
                        : 'Active';

                      return (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(u.id)}
                              onChange={() => toggleSelectUser(u.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                {u.role === UserRole.Admin ? (
                                  <Shield className="w-5 h-5 text-indigo-600" />
                                ) : u.role === UserRole.Teacher ? (
                                  <BookOpen className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{u.displayName}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                              {getRoleLabel(u.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <button
                                onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                              
                              {activeMenu === u.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setActiveMenu(null)} 
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                    <button
                                      onClick={() => handleEditUser(u)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit User
                                    </button>
                                    <button
                                      onClick={() => handleResetPassword(u)}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Key className="w-4 h-4" />
                                      Reset Password
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                      onClick={() => {
                                        setDeleteDialog({ open: true, user: u });
                                        setActiveMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete User
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitUser}
        user={editingUser}
        mode={modalMode}
        loading={modalLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteDialog.user?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Users"
        message={`Are you sure you want to delete ${selectedUsers.size} selected users? This action cannot be undone.`}
        confirmText={`Delete ${selectedUsers.size} Users`}
        type="danger"
      />
    </div>
  );
};
