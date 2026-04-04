import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { useAuth } from '../../../contexts/AuthProvider';
import { supabase } from '../../../supabase';

export const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      setDisplayName(user.user_metadata.display_name || '');
      setPhone(user.user_metadata.phone || '');
      setAvatarUrl(user.user_metadata.avatar_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          phone,
          avatar_url: avatarUrl,
        }
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{displayName || 'No name set'}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <User className="w-3 h-3" /> Display Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              value={user?.email || ''}
              disabled
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Your phone number"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Avatar URL</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" /> Profile updated!
            </motion.span>
          )}
        </div>
      </Card>
    </div>
  );
};
