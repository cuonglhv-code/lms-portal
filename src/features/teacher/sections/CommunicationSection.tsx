import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { cn } from '../../../utils/cn';
import { Student, Announcement, Message } from '../../../types/models';

interface CommunicationSectionProps {
  students: Student[];
  announcements: Announcement[];
  messages: Message[];
  onAddAnnouncement: (title: string, content: string, target: string) => void;
  onAddMessage: (studentId: string, content: string, replyTo?: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const CommunicationSection: React.FC<CommunicationSectionProps> = ({ 
  students, 
  announcements, 
  messages, 
  onAddAnnouncement, 
  onAddMessage, 
  onDeleteAnnouncement, 
  onDeleteMessage 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [msgContent, setMsgContent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Just now';
    if (ts.toDate) return format(ts.toDate(), 'MMM d, HH:mm');
    return format(new Date(ts), 'MMM d, HH:mm');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Communication Module</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Announcements */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Send Announcement</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Message content..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="all">All Students/Parents</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Button className="w-full" onClick={() => { onAddAnnouncement(title, content, target); setTitle(''); setContent(''); }}>
                Broadcast Announcement
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Announcements</h3>
            {announcements.map(a => (
              <Card key={a.id} className="p-4 relative group">
                <button 
                  onClick={() => onDeleteAnnouncement(a.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex justify-between items-start mb-2 pr-8">
                  <h4 className="font-bold text-indigo-700">{a.title}</h4>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(a.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
                <div className="mt-2 text-xs text-indigo-500 font-medium">
                  Target: {a.targetStudentId === 'all' ? 'All' : students.find(s => s.id === a.targetStudentId)?.name || 'Unknown'}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Messages/Questions */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {replyingTo ? `Reply to ${replyingTo.authorName}` : 'Send Message to Student'}
              </h3>
              {replyingTo && (
                <button onClick={() => setReplyingTo(null)} className="text-xs text-indigo-600 hover:underline">
                  Cancel Reply
                </button>
              )}
            </div>
            <div className="space-y-4">
              {!replyingTo && (
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
              <textarea
                placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
              />
              <Button className="w-full" onClick={() => { 
                onAddMessage(replyingTo ? replyingTo.studentId : selectedStudent, msgContent, replyingTo?.id); 
                setMsgContent(''); 
                setReplyingTo(null);
              }}>
                {replyingTo ? 'Send Reply' : 'Send Message'}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Messages & Replies</h3>
            {messages.map(m => {
              const isReply = !!m.replyTo;
              
              return (
                <Card key={m.id} className={cn(
                  "p-4 relative group",
                  isReply ? "ml-8 border-l-2 border-indigo-200 bg-gray-50/50" : "border-l-4 border-indigo-500"
                )}>
                  <div className="flex justify-between items-start mb-1 pr-8">
                    <span className="font-bold text-sm">{m.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(m.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.content}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-500">
                      To: {students.find(s => s.id === m.studentId)?.name || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isReply && (
                        <button 
                          onClick={() => setReplyingTo(m)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          REPLY
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteMessage(m.id)}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
