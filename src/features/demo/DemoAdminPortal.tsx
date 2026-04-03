import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Download,
} from 'lucide-react';
import { AppHeader, Sidebar, PageContainer, PageHeader } from '../../components/layout/LayoutComponents';
import { DemoBanner } from '../../components/DemoBanner';
import { useDemoAuth } from '../../lib/demoAuth';
import {
  mockUsers,
  mockStudents,
  mockClasses,
  mockCenters,
  mockMessages,
  mockDashboardStats,
} from '../../lib/mockData';
import { Card } from '../../components/common/Card';
import { StatCard, Badge, EmptyState } from '../../components/common/SharedComponents';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface DemoAdminPortalProps {
  user: { id: string; email: string; displayName: string; role: string };
}

type AdminTab = 'dashboard' | 'users' | 'classes' | 'centers' | 'analytics' | 'reports' | 'messaging';

export function DemoAdminPortal({ user }: DemoAdminPortalProps) {
  const { signOut } = useDemoAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard' as AdminTab, icon: BarChart3, label: 'Dashboard' },
    { id: 'users' as AdminTab, icon: Users, label: 'Users' },
    { id: 'classes' as AdminTab, icon: BookOpen, label: 'Classes' },
    { id: 'centers' as AdminTab, icon: Building2, label: 'Centers' },
    { id: 'analytics' as AdminTab, icon: BarChart3, label: 'Analytics' },
    { id: 'reports' as AdminTab, icon: FileSpreadsheet, label: 'Reports' },
    { id: 'messaging' as AdminTab, icon: Bell, label: 'Messaging' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={mockDashboardStats} />;
      case 'users':
        return <UsersView />;
      case 'classes':
        return <ClassesView />;
      case 'centers':
        return <CentersView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'messaging':
        return <MessagingView />;
      default:
        return <DashboardView stats={mockDashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DemoBanner onEnterDemo={() => {}} />
      <AppHeader
        type="admin"
        userName={user.displayName}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={navItems}
          activeId={activeTab}
          onItemClick={(id) => setActiveTab(id as AdminTab)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PageContainer>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </PageContainer>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ stats }: { stats: typeof mockDashboardStats }) {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your education platform" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} color="emerald" />
        <StatCard label="Total Teachers" value={stats.totalTeachers} icon={BookOpen} color="indigo" />
        <StatCard label="Total Classes" value={stats.totalClasses} icon={Calendar} color="purple" />
        <StatCard label="Total Centers" value={stats.totalCenters} icon={Building2} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Students This Month</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-indigo-600">{stats.newStudentsThisMonth}</div>
            <span className="text-sm font-medium text-emerald-600">+{stats.newStudentsTrend}% vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-medium text-gray-900">{stats.attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.attendanceRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Homework Completion</span>
                <span className="font-medium text-gray-900">{stats.homeworkCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${stats.homeworkCompletionRate}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const allUsers: Array<{ id: string; display_name?: string; email: string; type: 'user' | 'student'; role: string; status: string; created_at: string }> = [
    ...mockUsers.map(u => ({ ...u, type: 'user' as const })),
    ...mockStudents.map(s => ({ ...s, type: 'student' as const, display_name: s.display_name, role: 'student' })),
  ];

  const filteredUsers = allUsers.filter(u => 
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="User Management"
        description={`${allUsers.length} total users`}
        action={<Button><Plus className="w-4 h-4 mr-2" />Add User</Button>}
      />

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-md"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.display_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.type}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success">active</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ClassesView() {
  return (
    <div>
      <PageHeader
        title="Classes"
        description={`${mockClasses.length} total classes`}
        action={<Button><Plus className="w-4 h-4 mr-2" />Add Class</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map(cls => (
          <Card key={cls.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500">{cls.subject}</p>
              </div>
              <Badge variant="success">{cls.status}</Badge>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><span className="font-medium">Teacher:</span> {cls.teacher?.display_name}</p>
              <p><span className="font-medium">Center:</span> {cls.center?.name}</p>
              <p><span className="font-medium">Students:</span> {cls.student_count || 0}/{cls.max_students}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Calendar className="w-4 h-4 mr-1" />Sessions</Button>
              <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CentersView() {
  return (
    <div>
      <PageHeader
        title="Centers"
        description={`${mockCenters.length} centers`}
        action={<Button><Plus className="w-4 h-4 mr-2" />Add Center</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCenters.map(center => (
          <Card key={center.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <Badge variant="success">{center.status}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{center.name}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              {center.address && <p>{center.address}</p>}
              {center.phone && <p>{center.phone}</p>}
              {center.email && <p>{center.email}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-1" />Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div>
      <PageHeader title="Analytics" description="Performance metrics and insights" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value={mockDashboardStats.totalStudents} icon={GraduationCap} color="indigo" />
        <StatCard label="Attendance Rate" value={`${mockDashboardStats.attendanceRate}%`} icon={Calendar} color="emerald" />
        <StatCard label="Homework Completion" value={`${mockDashboardStats.homeworkCompletionRate}%`} icon={BookOpen} color="amber" />
        <StatCard label="Average Score" value="85%" icon={BarChart3} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">A (90-100)</span>
              <span className="font-medium">35%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '35%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">B (80-89)</span>
              <span className="font-medium">40%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full" style={{ width: '40%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">C (70-79)</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-amber-500 h-3 rounded-full" style={{ width: '20%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">D (Below 70)</span>
              <span className="font-medium">5%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: '5%' }} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Overview</h3>
          <div className="space-y-4">
            {mockClasses.slice(0, 4).map(cls => (
              <div key={cls.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{cls.name}</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 20 + 75)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 20 + 75)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and export data reports" />

      <div className="max-w-3xl">
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'students', label: 'Students', icon: GraduationCap, desc: 'All student records' },
              { id: 'classes', label: 'Classes', icon: BookOpen, desc: 'Class details' },
              { id: 'attendance', label: 'Attendance', icon: Calendar, desc: 'Attendance records' },
              { id: 'homework', label: 'Homework', icon: FileSpreadsheet, desc: 'Homework submissions' },
              { id: 'exams', label: 'Exams', icon: BarChart3, desc: 'Exam scores' },
            ].map(item => (
              <button
                key={item.id}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 text-left transition-all"
              >
                <item.icon className="w-5 h-5 text-gray-400 mb-2" />
                <span className="font-medium text-gray-900">{item.label}</span>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
          <div className="flex gap-4">
            <Button variant="outline">CSV (Excel Compatible)</Button>
            <Button variant="outline">JSON</Button>
          </div>
        </Card>

        <Button className="text-lg px-8 py-4">
          <Download className="w-5 h-5 mr-2" />
          Generate & Download
        </Button>
      </div>
    </div>
  );
}

function MessagingView() {
  return (
    <div>
      <PageHeader
        title="Messaging"
        description="Send announcements to students"
        action={<Button><Plus className="w-4 h-4 mr-2" />New Announcement</Button>}
      />

      <div className="space-y-4">
        {mockMessages.map(msg => (
          <Card key={msg.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{msg.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {msg.recipient_id === 'all' ? 'All Students' : 'Class'} - {new Date(msg.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{msg.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
