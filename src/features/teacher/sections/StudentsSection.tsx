import React, { useState } from 'react';
import { Search, Settings, Trash2, Plus } from 'lucide-react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Student, Class, Enrollment } from '../../../types/models';

interface StudentsSectionProps {
  students: Student[];
  classes: Class[];
  enrollments: Enrollment[];
  onAdd: (data: Omit<Student, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, data: Partial<Student>) => void;
  onDelete: (id: string) => void;
  onEnroll: (studentId: string, classId: string) => void;
  onUnenroll: (enrollmentId: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const StudentsSection: React.FC<StudentsSectionProps> = ({ 
  students, 
  classes, 
  enrollments, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onEnroll, 
  onUnenroll, 
  searchTerm, 
  setSearchTerm 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    entryLevel: '',
    targetOutcome: '',
    parentName: '',
    phone: ''
  });

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email || '',
      entryLevel: student.entryLevel,
      targetOutcome: student.targetOutcome,
      parentName: student.parentName || '',
      phone: student.phone || ''
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', email: '', entryLevel: '', targetOutcome: '', parentName: '', phone: '' });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Student Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Entry Level *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.entryLevel}
              onChange={(e) => setFormData({ ...formData, entryLevel: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Target Outcome *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.targetOutcome}
              onChange={(e) => setFormData({ ...formData, targetOutcome: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Parent Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {editingId && (
            <Button variant="secondary" onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', entryLevel: '', targetOutcome: '', parentName: '', phone: '' });
            }}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit}>
            {editingId ? <Settings className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            {editingId ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Entry Level</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Target</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Classes</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.entryLevel}</td>
                    <td className="px-6 py-4 text-gray-600 font-bold text-indigo-600">{student.targetOutcome}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {studentEnrollments.map(e => (
                          <span key={e.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            {classes.find(c => c.id === e.classId)?.name || 'Unknown'}
                            <button onClick={() => onUnenroll(e.id)} className="hover:text-indigo-900">
                              <Trash2 className="w-2.5 h-2.5 ml-1" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select 
                        className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onEnroll(student.id, e.target.value);
                          }
                        }}
                      >
                        <option value="">Enroll in...</option>
                        {classes.filter(c => !studentEnrollments.some(e => e.classId === c.id)).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => handleEdit(student)} className="p-2 h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => onDelete(student.id)} className="p-2 h-8 w-8 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
