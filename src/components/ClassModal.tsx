import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Card } from './common/Card';
import { Center } from '../services/centerService';
import { UserRecord, UserRole } from '../types/auth';
import { centerService } from '../services/centerService';
import { userService } from '../services/userService';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  classData: any | null;
  loading: boolean;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSubmit, classData, loading }) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade_level: '',
    teacher_id: '',
    center_id: '',
    max_students: 30,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (classData) {
        setFormData({
          name: classData.name || '',
          description: classData.description || '',
          subject: classData.subject || '',
          grade_level: classData.grade_level || '',
          teacher_id: classData.teacher_id || '',
          center_id: classData.center_id || '',
          max_students: classData.max_students || 30,
        });
      } else {
        setFormData({ name: '', description: '', subject: '', grade_level: '', teacher_id: '', center_id: '', max_students: 30 });
      }
    }
  }, [isOpen, classData]);

  const loadData = async () => {
    try {
      const [centersData, usersData] = await Promise.all([
        centerService.listCenters(),
        userService.listUsers({ role: UserRole.Teacher, pageSize: 100 }),
      ]);
      setCenters(centersData);
      setTeachers(usersData.users);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{classData ? 'Edit Class' : 'Add Class'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., IELTS Preparation" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g., English" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <Input value={formData.grade_level} onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })} placeholder="e.g., Intermediate" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Class description..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
              <select
                value={formData.center_id}
                onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">Select Center</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
            <Input type="number" min={1} max={100} value={formData.max_students} onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 30 })} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">{classData ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
