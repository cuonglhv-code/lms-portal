import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  GraduationCap as ExamsIcon, 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  TrendingUp,
  Bell,
  HelpCircle,
  User,
} from 'lucide-react';
import { AppHeader, Sidebar, PageContainer } from '../../components/layout/LayoutComponents';
import { LoadingSpinner } from '../../components/common/SharedComponents';

import { Button } from '../../components/common/Button';
import { useStudentData } from '../../hooks/student/useStudentData';
import { useStudentClasses } from '../../hooks/student/useStudentClasses';
import { useStudentHomework } from '../../hooks/student/useStudentHomework';
import { useStudentExams } from '../../hooks/student/useStudentExams';
import { useStudentAttendance } from '../../hooks/student/useStudentAttendance';
import { useStudentAnnouncements, useStudentMessages } from '../../hooks/student/useStudentMessages';
import { studentService } from '../../services/studentService';

import { DashboardSection } from './sections/DashboardSection';
import { ClassesSection } from './sections/ClassesSection';
import { ClassDetailSection } from './sections/ClassDetailSection';
import { HomeworkSection } from './sections/HomeworkSection';
import { ExamsSection } from './sections/ExamsSection';
import { ProgressSection } from './sections/ProgressSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { StudentProfileSection } from './sections/ProfileSection';

interface StudentAppProps {
  user: { id: string; email?: string };
  onLogout: () => void;
}

export const StudentApp: React.FC<StudentAppProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { student, loading: studentLoading } = useStudentData(user.email || null);
  const { classes, loading: classesLoading } = useStudentClasses(student?.id || null);
  const { homework, loading: homeworkLoading } = useStudentHomework(student?.id || null);
  const { exams, loading: examsLoading } = useStudentExams(student?.id || null);
  const { attendance, loading: attendanceLoading } = useStudentAttendance(student?.id || null);
  const { announcements, loading: announcementsLoading } = useStudentAnnouncements(student?.id || null);
  const { messages, loading: messagesLoading } = useStudentMessages(student?.id || null);

  const handleSendMessage = async (content: string, authorName: string) => {
    if (student) {
      await studentService.sendMessage(student.id, content, authorName);
    }
  };

  if (studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find a student record associated with your email ({user.email}). 
            Please contact your teacher to be enrolled.
          </p>
          <Button onClick={onLogout} variant="primary" className="w-full">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'classes', path: '/student/classes', icon: Building2, label: 'My Classes' },
    { id: 'homework', path: '/student/homework', icon: BookOpen, label: 'Homework' },
    { id: 'exams', path: '/student/exams', icon: ExamsIcon, label: 'My Exams' },
    { id: 'progress', path: '/student/progress', icon: TrendingUp, label: 'My Progress' },
    { id: 'communication', path: '/student/messages', icon: Bell, label: 'Messages' },
    { id: 'profile', path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.includes('/student/classes')) return 'classes';
    if (p.includes('/student/homework')) return 'homework';
    if (p.includes('/student/exams')) return 'exams';
    if (p.includes('/student/progress')) return 'progress';
    if (p.includes('/student/messages')) return 'communication';
    if (p.includes('/student/profile')) return 'profile';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        type="student"
        userName={student?.name || user.email}
        userEmail={user.email}
        userAvatar={student?.avatarUrl}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={navItems}
          activeId={getActiveTab()}
          onItemClick={(id) => {
            const item = navItems.find(n => n.id === id);
            if (item) navigate(item.path);
          }}
        />

        <PageContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes>
                <Route path="dashboard" element={
                  <DashboardSection
                    classes={classes}
                    announcements={announcements}
                    attendance={attendance}
                    exams={exams}
                    studentName={student.name}
                  />
                } />
                <Route path="classes" element={
                  <ClassesSection classes={classes} />
                } />
                <Route path="classes/:classId" element={
                  <ClassDetailWrapper classes={classes} homework={homework} />
                } />
                <Route path="homework" element={
                  <HomeworkSection homework={homework} classes={classes} />
                } />
                <Route path="exams" element={
                  <ExamsSection exams={exams} />
                } />
                <Route path="progress" element={
                  <ProgressSection
                    student={student}
                    attendance={attendance}
                    homework={homework}
                    exams={exams}
                  />
                } />
                <Route path="messages" element={
                  <CommunicationSection
                    announcements={announcements}
                    messages={messages}
                    studentId={student.id}
                    studentName={student.name}
                    onSendMessage={handleSendMessage}
                  />
                } />
                <Route path="profile" element={
                  <StudentProfileSection studentId={student.id} />
                } />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </PageContainer>
      </div>
    </div>
  );
};

// Helper to inject useParams dynamically into ClassDetailSection
import { useParams } from 'react-router-dom';
function ClassDetailWrapper({ classes, homework }: { classes: any[], homework: any[] }) {
  const { classId } = useParams();
  const classObj = classes.find(c => c.id === classId) || null;
  return (
    <ClassDetailSection
      classObj={classObj}
      homework={homework}
      loading={false}
    />
  );
}
