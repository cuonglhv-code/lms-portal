import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Bell,
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
  mockMessages,
} from '../../lib/mockData';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/SharedComponents';

interface DemoStudentAppProps {
  user: { id: string; email: string; displayName: string; role: string };
}

export function DemoStudentApp({ user }: DemoStudentAppProps) {
  const { signOut } = useDemoAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Find the student record
  const student = mockStudents.find(s => s.parent_email === user.email || s.email === user.email);
  
  // Get enrolled classes
  const enrolledClassIds = mockEnrollments
    .filter(e => e.student_id === student?.id)
    .map(e => e.class_id);
  const enrolledClasses = mockClasses.filter(c => enrolledClassIds.includes(c.id));

  // Get homework for this student
  const studentHomework = mockHomework.filter(hw => enrolledClassIds.includes(hw.class_id));

  // Get exams for enrolled classes
  const studentExams = mockExams.filter(e => enrolledClassIds.includes(e.class_id));

  // Calculate attendance rate
  const studentAttendance = mockAttendance.filter(a => a.student_id === student?.id);
  const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((presentCount / studentAttendance.length) * 100) 
    : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'My Classes', icon: Building2 },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'exams', label: 'My Exams', icon: GraduationCap },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView student={student} enrolledClasses={enrolledClasses} attendanceRate={attendanceRate} announcements={mockMessages} />;
      case 'classes':
        return <ClassesView classes={enrolledClasses} />;
      case 'homework':
        return <HomeworkView homework={studentHomework} classes={mockClasses} />;
      case 'exams':
        return <ExamsView exams={studentExams} classes={mockClasses} />;
      case 'progress':
        return <ProgressView student={student} attendanceRate={attendanceRate} homeworkCount={studentHomework.length} examCount={studentExams.length} />;
      case 'messages':
        return <MessagesView messages={mockMessages} />;
      default:
        return <DashboardView student={student} enrolledClasses={enrolledClasses} attendanceRate={attendanceRate} announcements={mockMessages} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DemoBanner onEnterDemo={() => {}} />
      <AppHeader
        type="student"
        userName={student?.display_name || user.displayName}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={navItems}
          activeId={activeSection}
          onItemClick={setActiveSection}
        />
        <PageContainer>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </PageContainer>
      </div>
    </div>
  );
}

function DashboardView({ student, enrolledClasses, attendanceRate, announcements }: {
  student: any;
  enrolledClasses: any[];
  attendanceRate: number;
  announcements: any[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {student?.display_name}!</h2>
      <p className="text-gray-500 mb-6">Here's what's happening with your classes</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-indigo-600">{enrolledClasses.length}</p>
          <p className="text-gray-500 mt-1">Enrolled Classes</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-emerald-600">{attendanceRate}%</p>
          <p className="text-gray-500 mt-1">Attendance Rate</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-4xl font-bold text-amber-600">{announcements.length}</p>
          <p className="text-gray-500 mt-1">Announcements</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h3>
          <div className="space-y-3">
            {enrolledClasses.slice(0, 4).map(cls => (
              <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cls.name}</p>
                  <p className="text-sm text-gray-500">{cls.teacher?.display_name}</p>
                </div>
                <Badge variant="success">{cls.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h3>
          <div className="space-y-3">
            {announcements.slice(0, 3).map(msg => (
              <div key={msg.id} className="border-l-4 border-indigo-500 pl-4">
                <h4 className="font-medium text-gray-900">{msg.title}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClassesView({ classes }: { classes: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => (
          <Card key={cls.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500">{cls.subject}</p>
              </div>
              <Badge variant="success">{cls.grade_level}</Badge>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Teacher:</span> {cls.teacher?.display_name}</p>
              <p><span className="font-medium">Schedule:</span></p>
              {cls.schedule?.map((s: any, i: number) => (
                <p key={i} className="text-gray-500 ml-2">{s.day}: {s.startTime} - {s.endTime}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HomeworkView({ homework, classes }: { homework: any[]; classes: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Homework</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {homework.map(hw => {
          const cls = classes.find(c => c.id === hw.class_id);
          const isOverdue = hw.due_date && new Date(hw.due_date) < new Date();
          return (
            <Card key={hw.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                {isOverdue ? (
                  <Badge variant="danger">Overdue</Badge>
                ) : (
                  <Badge variant="info">Active</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{cls?.name}</p>
              <p className="text-sm text-gray-600 mb-4">{hw.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'N/A'}
                </span>
                <span className="text-xs text-gray-500">{hw.total_points} points</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExamsView({ exams, classes }: { exams: any[]; classes: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Exams</h2>
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
              {exams.map(exam => {
                const cls = classes.find(c => c.id === exam.class_id);
                return (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.title}</td>
                    <td className="px-4 py-3 text-gray-600">{cls?.name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{exam.exam_type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={exam.status === 'completed' ? 'success' : 'info'}>
                        {exam.status}
                      </Badge>
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

function ProgressView({ student, attendanceRate, homeworkCount, examCount }: {
  student: any;
  attendanceRate: number;
  homeworkCount: number;
  examCount: number;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#10b981" strokeWidth="12" fill="none"
                  strokeDasharray={`${attendanceRate * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{attendanceRate}%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Classes Enrolled</span>
              <span className="font-semibold text-gray-900">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Homework Assigned</span>
              <span className="font-semibold text-gray-900">{homeworkCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exams Scheduled</span>
              <span className="font-semibold text-gray-900">{examCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MessagesView({ messages }: { messages: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages & Announcements</h2>
      <div className="space-y-4">
        {messages.map(msg => (
          <Card key={msg.id} className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{msg.title}</h3>
              <Badge variant="info">{msg.message_type}</Badge>
            </div>
            <p className="text-gray-600 mb-2">{msg.content}</p>
            <span className="text-xs text-gray-400">
              {new Date(msg.created_at).toLocaleDateString()}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
