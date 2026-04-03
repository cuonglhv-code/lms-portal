import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  Download,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  LayoutDashboard,
  Building2,
} from 'lucide-react';
import { AppHeader, Sidebar, PageContainer } from '../../components/layout/LayoutComponents';
import { DemoBanner } from '../../components/DemoBanner';
import { useDemoAuth } from '../../lib/demoAuth';
import {
  mockStudents,
  mockClasses,
  mockEnrollments,
  mockAttendance,
  mockHomework,
  mockExams,
  mockSessions,
  mockMessages,
} from '../../lib/mockData';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/SharedComponents';
import { Button } from '../../components/common/Button';

interface DemoTeacherAppProps {
  user: { id: string; email: string; displayName: string; role: string };
}

export function DemoTeacherApp({ user }: DemoTeacherAppProps) {
  const { signOut } = useDemoAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const stats = {
    totalStudents: mockStudents.length,
    totalClasses: mockClasses.length,
    totalEnrollments: mockEnrollments.length,
    pendingHomework: mockHomework.filter(h => h.status === 'active').length,
  };

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: Building2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={stats} />;
      case 'classes':
        return <ClassesView />;
      case 'students':
        return <StudentsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'homework':
        return <HomeworkView />;
      case 'exams':
        return <ExamsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DemoBanner onEnterDemo={() => {}} />
      <AppHeader
        type="teacher"
        userName={user.displayName}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={teacherNavItems}
          activeId={activeTab}
          onItemClick={setActiveTab}
        />
        <PageContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </PageContainer>
      </div>
    </div>
  );
}

function DashboardView({ stats }: { stats: typeof DemoTeacherApp.prototype.stats }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="indigo" />
        <StatCard label="Total Classes" value={stats.totalClasses} icon={Building2} color="emerald" />
        <StatCard label="Active Enrollments" value={stats.totalEnrollments} icon={BookOpen} color="amber" />
        <StatCard label="Pending Homework" value={stats.pendingHomework} icon={Calendar} color="purple" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            {mockMessages.slice(0, 3).map(msg => (
              <div key={msg.id} className="border-l-4 border-indigo-500 pl-4">
                <h4 className="font-medium text-gray-900">{msg.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {mockSessions.slice(0, 3).map(session => {
              const cls = mockClasses.find(c => c.id === session.class_id);
              return (
                <div key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-500">{cls?.name}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(session.session_date).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClassesView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
        <Button><Plus className="w-4 h-4 mr-2" />Add Class</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map(cls => (
          <Card key={cls.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500">{cls.subject}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {cls.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Teacher:</span> {cls.teacher?.display_name}</p>
              <p><span className="font-medium">Students:</span> {cls.student_count || 0}/{cls.max_students}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentsView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <Button><Plus className="w-4 h-4 mr-2" />Add Student</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{student.display_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.parent_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.parent_email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {student.status}
                    </span>
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

function AttendanceView() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockAttendance.slice(0, 20).map(record => {
                const student = mockStudents.find(s => s.id === record.student_id);
                const cls = mockClasses.find(c => c.id === record.class_id);
                const statusColors = {
                  present: 'bg-green-100 text-green-700',
                  absent: 'bg-red-100 text-red-700',
                  late: 'bg-amber-100 text-amber-700',
                  excused: 'bg-gray-100 text-gray-700',
                };
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{student?.display_name}</td>
                    <td className="px-4 py-3 text-gray-600">{cls?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{record.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function HomeworkView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Homework</h2>
        <Button><Plus className="w-4 h-4 mr-2" />Create Homework</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockHomework.map(hw => {
          const cls = mockClasses.find(c => c.id === hw.class_id);
          return (
            <Card key={hw.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                <span className="text-sm text-gray-500">{hw.total_points} pts</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{cls?.name}</p>
              <p className="text-sm text-gray-600 mb-4">{hw.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'N/A'}
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {hw.status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExamsView() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Exams</h2>
        <Button><Plus className="w-4 h-4 mr-2" />Create Exam</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockExams.map(exam => {
                const cls = mockClasses.find(c => c.id === exam.class_id);
                return (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.title}</td>
                    <td className="px-4 py-3 text-gray-600">{cls?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.exam_type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReportsView() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Student Report', icon: Users, desc: 'All student records' },
          { label: 'Class Report', icon: Building2, desc: 'Class details' },
          { label: 'Attendance Report', icon: Calendar, desc: 'Attendance records' },
          { label: 'Homework Report', icon: BookOpen, desc: 'Homework submissions' },
          { label: 'Exam Report', icon: GraduationCap, desc: 'Exam scores' },
          { label: 'Export All', icon: Download, desc: 'Export all data' },
        ].map(item => (
          <Card key={item.label} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <item.icon className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-semibold text-gray-900">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
