import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { UserRecord, UserRole } from '../types/auth';
import { getRoleLabel } from '../utils/permissions';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: UserRecord | null;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface UserFormData {
  email: string;
  password?: string;
  displayName: string;
  role: UserRole;
  status?: 'active' | 'suspended' | 'invited' | 'archived';
}

export function UserModal({ isOpen, onClose, onSubmit, user, mode, loading }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    displayName: '',
    role: UserRole.Student,
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          status: (user as any).status || 'active',
        });
      } else {
        setFormData({
          email: '',
          password: '',
          displayName: '',
          role: UserRole.Student,
          status: 'active',
        });
      }
      setError(null);
    }
  }, [isOpen, mode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'create' && !formData.password) {
      setError('Password is required');
      return;
    }

    if (!formData.email || !formData.displayName) {
      setError('Email and name are required');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <Card className="relative z-10 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New User' : `Edit ${user?.displayName}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <Input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
              disabled={mode === 'edit'}
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value={UserRole.Student}>{getRoleLabel(UserRole.Student)}</option>
              <option value={UserRole.Teacher}>{getRoleLabel(UserRole.Teacher)}</option>
              <option value={UserRole.Admin}>{getRoleLabel(UserRole.Admin)}</option>
            </select>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
