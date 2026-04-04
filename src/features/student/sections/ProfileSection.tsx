import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, CheckCircle, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { supabase } from '../../../supabase';

interface StudentProfile {
  display_name: string;
  phone: string;
  parent_name: string;
  parent_email: string;
  entry_level: string;
  target_outcome: string;
  avatar_url: string;
}

export const StudentProfileSection: React.FC<{ studentId: string | null }> = ({ studentId }) => {
  const [profile, setProfile] = useState<StudentProfile>({
    display_name: '',
    phone: '',
    parent_name: '',
    parent_email: '',
    entry_level: '',
    target_outcome: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          phone: data.phone || '',
          parent_name: data.parent_name || '',
          parent_email: data.parent_email || '',
          entry_level: data.entry_level || '',
          target_outcome: data.target_outcome || '',
          avatar_url: data.avatar_url || '',
        });
      }
    };
    fetchProfile();
  }, [studentId]);

  const handleSave = async () => {
    if (!studentId) return;
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from('students').update({
        display_name: profile.display_name,
        phone: profile.phone,
        parent_name: profile.parent_name,
        parent_email: profile.parent_email,
        avatar_url: profile.avatar_url,
      }).eq('id', studentId);
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
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{profile.display_name || 'No name set'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <User className="w-3 h-3" /> Full Name
            </label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.display_name} onChange={e => setProfile({ ...profile, display_name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Parent Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.parent_name} onChange={e => setProfile({ ...profile, parent_name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Parent Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.parent_email} onChange={e => setProfile({ ...profile, parent_email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Entry Level
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">{profile.entry_level || 'N/A'}</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Target Outcome</label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">{profile.target_outcome || 'N/A'}</div>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Avatar URL</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://example.com/avatar.jpg" />
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
