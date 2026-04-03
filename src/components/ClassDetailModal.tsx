import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Calendar, Clock, FileText, CheckCircle } from 'lucide-react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Card } from './common/Card';
import { Session, sessionService } from '../services/sessionService';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ isOpen, onClose, classId, className }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    content: '',
    session_date: '',
    duration_minutes: 60,
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isOpen && classId) {
      loadSessions();
    }
  }, [isOpen, classId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.listSessionsByClass(classId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingSession) {
        await sessionService.updateSession(editingSession.id, sessionForm);
      } else {
        await sessionService.createSession({ ...sessionForm, class_id: classId });
      }
      setShowSessionForm(false);
      setEditingSession(null);
      setSessionForm({ title: '', content: '', session_date: '', duration_minutes: 60, notes: '' });
      loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      content: session.content || '',
      session_date: session.session_date.split('T')[0],
      duration_minutes: session.duration_minutes,
      notes: session.notes || '',
    });
    setShowSessionForm(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session?')) return;
    try {
      await sessionService.deleteSession(sessionId);
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{className}</h2>
            <p className="text-sm text-gray-500">Lesson Planning</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { setEditingSession(null); setSessionForm({ title: '', content: '', session_date: '', duration_minutes: 60, notes: '' }); setShowSessionForm(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Session
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {showSessionForm ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
              <form onSubmit={handleSubmitSession} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
                    <Input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} placeholder="e.g., Introduction to Vocabulary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <Input type="date" value={sessionForm.session_date} onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <Input type="number" min={15} max={240} value={sessionForm.duration_minutes} onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content / Lesson Notes</label>
                  <textarea
                    value={sessionForm.content}
                    onChange={(e) => setSessionForm({ ...sessionForm, content: e.target.value })}
                    placeholder="Lesson content, topics covered..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowSessionForm(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" loading={formLoading} className="flex-1">{editingSession ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : sessions.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sessions planned yet</p>
                  <p className="text-sm">Click "Add Session" to create your first lesson plan</p>
                </Card>
              ) : (
                sessions.map((session, index) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex flex-col items-center justify-center">
                          <span className="text-xs text-indigo-600 font-medium">Session</span>
                          <span className="text-lg font-bold text-indigo-700">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{session.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(session.session_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {session.duration_minutes} min</span>
                            {session.homework && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Has homework</span>}
                          </div>
                          {session.content && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{session.content}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSession(session)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-500" /></button>
                        <button onClick={() => handleDeleteSession(session.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
