import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Bell, Send, MessageCircle, Mail } from 'lucide-react';

import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Announcement, Message } from '../../../types/models';

interface CommunicationSectionProps {
  announcements: Announcement[];
  messages: Message[];
  studentId: string;
  studentName: string;
  onSendMessage: (content: string, authorName: string) => Promise<void>;
}

export const CommunicationSection: React.FC<CommunicationSectionProps> = ({
  announcements,
  messages,
  studentId,
  studentName,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    
    setSending(true);
    try {
      await onSendMessage(messageContent.trim(), studentName);
      setMessageContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Communication</h1>
        <p className="text-gray-500 text-sm mt-1">Announcements and messages</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Announcements
            {announcements.length > 0 && (
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {announcements.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'messages'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            My Messages
            {messages.length > 0 && (
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((ann, idx) => (
              <motion.div
                key={ann.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl">
                      <Bell className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                        <span className="text-xs text-gray-400">
                          {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{ann.content}</p>
                      {ann.targetStudentId !== 'all' && (
                        <span className="inline-block mt-3 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          Personal Message
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-500">Announcements from your teachers will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Send a Message
            </h3>
            <div className="space-y-4">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message to your teacher..."
                className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sending}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Message History</h3>
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <MessageCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900">{msg.authorName}</span>
                          <span className="text-xs text-gray-400">
                            {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'MMM d, yyyy HH:mm') : 'Recently'}
                          </span>
                        </div>
                        <p className="text-gray-600">{msg.content}</p>
                        {msg.replyTo && (
                          <span className="inline-block mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            Reply
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet. Send a message to start the conversation!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
