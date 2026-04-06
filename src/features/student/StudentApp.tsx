import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  GraduationCap, 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  GraduationCap as ExamsIcon,
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
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
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

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/student' || path === '/student/' || path === '/') return 'dashboard';
    if (path.includes('/student/classes/') && params.classId) return 'class-detail';
    if (path.includes('/student/classes')) return 'classes';
    if (path.includes('/student/homework')) return 'homework';
    if (path.includes('/student/exams')) return 'exams';
    if (path.includes('/student/progress')) return 'progress';
    if (path.includes('/student/messages')) return 'communication';
    if (path.includes('/student/profile')) return 'profile';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  const navItems = [
    { id: 'dashboard', path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'classes', path: '/student/classes', icon: Building2, label: 'My Classes' },
    { id: 'homework', path: '/student/homework', icon: BookOpen, label: 'Homework' },
    { id: 'exams', path: '/student/exams', icon: ExamsIcon, label: 'My Exams' },
    { id: 'progress', path: '/student/progress', icon: TrendingUp, label: 'My Progress' },
    { id: 'communication', path: '/student/messages', icon: Bell, label: 'Messages' },
    { id: 'profile', path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <DashboardSection
            classes={classes}
            announcements={announcements}
            attendance={attendance}
            exams={exams}
            studentName={student.name}
          />
        );
      case 'classes':
        return <ClassesSection classes={classes} />;
      case 'class-detail':
        const classObj = classes.find(c => c.id === params.classId);
        return (
          <ClassDetailSection
            classObj={classObj || null}
            homework={homework}
            loading={false}
          />
        );
      case 'homework':
        return <HomeworkSection homework={homework} classes={classes} />;
      case 'exams':
        return <ExamsSection exams={exams} />;
      case 'progress':
        return (
          <ProgressSection
            student={student}
            attendance={attendance}
            homework={homework}
            exams={exams}
          />
        );
      case 'communication':
        return (
          <CommunicationSection
            announcements={announcements}
            messages={messages}
            studentId={student.id}
            studentName={student.name}
            onSendMessage={handleSendMessage}
          />
        );
      case 'profile':
        return <StudentProfileSection studentId={student.id} />;
      default:
        return (
          <DashboardSection
            classes={classes}
            announcements={announcements}
            attendance={attendance}
            exams={exams}
            studentName={student.name}
          />
        );
    }
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
          activeId={currentSection === 'class-detail' ? 'classes' : currentSection}
          onItemClick={(id) => {
            const item = navItems.find(n => n.id === id);
            if (item) navigate(item.path);
          }}
        />

        <PageContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection + (params.classId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </PageContainer>
      </div>
    </div>
  );
};
