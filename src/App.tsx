import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Download, 
  LogOut, 
  HelpCircle,
  FileSpreadsheet,
  LayoutDashboard,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppHeader, Sidebar, PageContainer } from './components/layout/LayoutComponents';
import { LoadingSpinner } from './components/common/SharedComponents';

// Context & Providers
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { AdminRoute } from './components/AdminRoute';
import { AdminPortal } from './components/AdminPortal';
import { Unauthorized } from './components/Unauthorized';

// Services & Hooks
import { excelService } from './services/excelService';
import { useStudents } from './hooks/useStudents';
import { useClasses } from './hooks/useClasses';
import { useEnrollments } from './hooks/useEnrollments';
import { useAttendance } from './hooks/useAttendance';
import { useHomework } from './hooks/useHomework';
import { useExams } from './hooks/useExams';
import { useAnnouncements } from './hooks/useAnnouncements';
import { useMessages } from './hooks/useMessages';
import { useTeacherActions } from './hooks/useTeacherActions';

// Components
import { Button } from './components/common/Button';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { LoginView } from './features/auth/LoginView';

// Section Features
import { DashboardSection } from './features/teacher/sections/DashboardSection';
import { ClassesSection } from './features/teacher/sections/ClassesSection';
import { ClassDetailSection } from './features/teacher/sections/ClassDetailSection';
import { StudentsSection } from './features/teacher/sections/StudentsSection';
import { AttendanceSection } from './features/teacher/sections/AttendanceSection';
import { HomeworkSection } from './features/teacher/sections/HomeworkSection';
import { ExamsSection } from './features/teacher/sections/ExamsSection';
import { CommunicationSection } from './features/teacher/sections/CommunicationSection';
import { ReportsSection } from './features/teacher/sections/ReportsSection';
import { ExportSection } from './features/teacher/sections/ExportSection';
import { StudentApp } from './features/student/StudentApp';

// Types
import { Class, Tab } from './types/models';
import { UserRole } from './types/auth';

function MainApp() {
  const { user, role, loading, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  // Data Hooks
  const { data: students } = useStudents();
  const { data: classes } = useClasses();
  const { data: enrollments } = useEnrollments();
  const { data: attendance } = useAttendance();
  const { data: homework } = useHomework();
  const { data: exams } = useExams();
  const { data: announcements } = useAnnouncements();
  const { data: messages } = useMessages();

  // Action Hooks
  const { 
    addStudent, updateStudent, deleteStudent,
    addClass, updateClass, deleteClass,
    enrollStudent, unenrollStudent,
    updateAttendance, updateHomework, updateExamScore,
    addAnnouncement, deleteAnnouncement,
    addMessage, deleteMessage,
    importStudentsBatch, importClassesBatch, importLessonsBatch,
  } = useTeacherActions();

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    await signIn(email, pass);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginView onEmailLogin={handleEmailLogin} />;
  }

  if (role === UserRole.Student) {
    return (
      <StudentApp 
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (role === UserRole.Admin) {
    return <AdminPortal />;
  }

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: Building2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'communication', label: 'Communication', icon: HelpCircle },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'classes') {
      setSelectedClassId('');
    }
    setActiveTab(id as Tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        type="teacher"
        userName={user.displayName}
        userEmail={user.email}
        userAvatar={user.photoURL}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={teacherNavItems.map(item => ({ ...item, id: item.id as Tab }))}
          activeId={activeTab}
          onItemClick={handleTabClick}
        />

        <PageContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedClassId ? '-detail' : '')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardSection 
                  students={students} 
                  classes={classes} 
                  enrollments={enrollments}
                  attendance={attendance}
                  homework={homework}
                  exams={exams}
                  onViewClass={(cl) => {
                    setSelectedClassId(cl.id);
                    setActiveTab('classes');
                  }}
                />
              )}

              {activeTab === 'classes' && !selectedClassId && (
                <ClassesSection 
                  classes={classes} 
                  onAdd={addClass} 
                  onUpdate={updateClass} 
                  onDelete={(id) => setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Class',
                    message: 'Are you sure you want to delete this class? This action cannot be undone.',
                    onConfirm: () => deleteClass(id)
                  })}
                  onView={(cl) => setSelectedClassId(cl.id)}
                  onImportClasses={importClassesBatch}
                  onImportLessons={importLessonsBatch}
                />
              )}

              {activeTab === 'classes' && selectedClassId && selectedClass && (
                <ClassDetailSection 
                  classObj={selectedClass}
                  students={students}
                  enrollments={enrollments}
                  attendance={attendance}
                  homework={homework}
                  exams={exams}
                  onBack={() => setSelectedClassId('')}
                  setActiveTab={setActiveTab}
                  setSelectedClassId={setSelectedClassId}
                  setSelectedDate={setSelectedDate}
                />
              )}

              {activeTab === 'students' && (
                <StudentsSection 
                  students={students}
                  classes={classes}
                  enrollments={enrollments}
                  onAdd={addStudent}
                  onUpdate={updateStudent}
                  onDelete={(id) => setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Student',
                    message: 'Are you sure you want to delete this student? All their records will be removed.',
                    onConfirm: () => deleteStudent(id)
                  })}
                  onEnroll={enrollStudent}
                  onUnenroll={unenrollStudent}
                  onImportStudents={importStudentsBatch}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceSection 
                  students={students}
                  classes={classes}
                  enrollments={enrollments}
                  attendance={attendance}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedClassId={selectedClassId}
                  setSelectedClassId={setSelectedClassId}
                  onUpdate={updateAttendance}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}

              {activeTab === 'homework' && (
                <HomeworkSection 
                  students={students}
                  classes={classes}
                  enrollments={enrollments}
                  homework={homework}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedClassId={selectedClassId}
                  setSelectedClassId={setSelectedClassId}
                  onUpdate={updateHomework}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}

              {activeTab === 'exams' && (
                <ExamsSection 
                  students={students}
                  classes={classes}
                  enrollments={enrollments}
                  exams={exams}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedClassId={selectedClassId}
                  setSelectedClassId={setSelectedClassId}
                  onUpdate={updateExamScore}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              )}

              {activeTab === 'communication' && (
                <CommunicationSection 
                  students={students} 
                  announcements={announcements} 
                  messages={messages}
                  onAddAnnouncement={addAnnouncement}
                  onAddMessage={addMessage}
                  onDeleteAnnouncement={deleteAnnouncement}
                  onDeleteMessage={deleteMessage}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsSection 
                  students={students}
                  classes={classes}
                  enrollments={enrollments}
                  attendance={attendance}
                  homework={homework}
                  exams={exams}
                />
              )}

              {activeTab === 'export' && (
                <ExportSection onExport={() => excelService.exportToExcel(students, classes, enrollments, attendance, homework, exams)} />
              )}
            </motion.div>
          </AnimatePresence>
        </PageContainer>

        <ConfirmDialog 
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPortal />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}