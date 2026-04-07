import React, { useState, useCallback } from 'react';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  HelpCircle,
  FileSpreadsheet,
  LayoutDashboard,
  Building2,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AppHeader, Sidebar, PageContainer } from '../../components/layout/LayoutComponents';
import { LoadingSpinner } from '../../components/common/SharedComponents';

// Context & Providers
import { useAuth } from '../../contexts/AuthProvider';

// Services & Hooks
import { excelService } from '../../services/excelService';
import { useStudents } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';
import { useEnrollments } from '../../hooks/useEnrollments';
import { useAttendance } from '../../hooks/useAttendance';
import { useHomework } from '../../hooks/useHomework';
import { useExams } from '../../hooks/useExams';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useMessages } from '../../hooks/useMessages';
import { useTeacherActions } from '../../hooks/useTeacherActions';

// Components
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

// Section Features
import { DashboardSection } from './sections/DashboardSection';
import { ClassesSection } from './sections/ClassesSection';
import { ClassDetailSection } from './sections/ClassDetailSection';
import { StudentsSection } from './sections/StudentsSection';
import { AttendanceSection } from './sections/AttendanceSection';
import { HomeworkSection } from './sections/HomeworkSection';
import { ExamsSection } from './sections/ExamsSection';
import { CommunicationSection } from './sections/CommunicationSection';
import { ReportsSection } from './sections/ReportsSection';
import { ProfileSection } from './sections/ProfileSection';
import { ExportSection } from './sections/ExportSection';

// Types
import { Tab } from '../../types/models';

export function TeacherApp() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {} 
  });

  const handleLogout = useCallback(async () => {
    console.log('[TeacherApp] handleLogout called');
    try {
      console.log('[TeacherApp] Calling signOut...');
      await signOut();
      console.log('[TeacherApp] signOut completed');
    } catch (error) {
      console.error('[TeacherApp] signOut error:', error);
    }
    console.log('[TeacherApp] Redirecting to home...');
    window.location.href = '/';
  }, [signOut]);

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
    { id: 'classes', label: 'Classes', icon: Building2, path: '/teacher/classes' },
    { id: 'students', label: 'Students', icon: Users, path: '/teacher/students' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, path: '/teacher/attendance' },
    { id: 'homework', label: 'Homework', icon: BookOpen, path: '/teacher/homework' },
    { id: 'exams', label: 'Exams', icon: GraduationCap, path: '/teacher/exams' },
    { id: 'communication', label: 'Communication', icon: HelpCircle, path: '/teacher/communication' },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet, path: '/teacher/reports' },
    { id: 'profile', label: 'Profile', icon: User, path: '/teacher/profile' },
  ];

  // Derive active id from pathname for sidebar
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/teacher/classes')) return 'classes';
    if (path.includes('/teacher/students')) return 'students';
    if (path.includes('/teacher/attendance')) return 'attendance';
    if (path.includes('/teacher/homework')) return 'homework';
    if (path.includes('/teacher/exams')) return 'exams';
    if (path.includes('/teacher/communication')) return 'communication';
    if (path.includes('/teacher/reports')) return 'reports';
    if (path.includes('/teacher/profile')) return 'profile';
    if (path.includes('/teacher/export')) return 'export';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath() as Tab;

  const handleTabClick = (id: string, itemPath?: string) => {
    if (itemPath) {
      navigate(itemPath);
    } else {
      const item = teacherNavItems.find(n => n.id === id);
      if (item && item.path) navigate(item.path);
    }
  };

  // Helper for Class Detail view
  const ClassDetailWrapper = () => {
    const { id } = useParams();
    const selectedClass = classes.find(c => c.id === id);
    if (!selectedClass) return <div className="p-8 text-center text-gray-500">Class not found</div>;

    return (
      <ClassDetailSection 
        classObj={selectedClass}
        students={students}
        enrollments={enrollments}
        attendance={attendance}
        homework={homework}
        exams={exams}
        onBack={() => navigate('/teacher/classes')}
        setActiveTab={(tab) => navigate(`/teacher/${tab}`)}
        setSelectedClassId={(clsId) => navigate(`/teacher/classes/${clsId}`)} // Not strictly replacing this prop yet if deeply used, to avoid over-refactoring the component here, but will handle via redirect wrapper if needed.
        setSelectedDate={setSelectedDate}
      />
    );
  };

  // State lifting wrappers to match expected props for shared components smoothly
  // Since we don't have selectedClassId in state anymore (we have it in URL), 
  // sections that require selectedClassId & setSelectedClassId to stay compatible 
  // might just need dummy props or we migrate their local state inside them in step 5,
  // but for now we provide a wrapper that holds it if they expect it as prop.
  
  const [tempClassId, setTempClassId] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        type="teacher"
        userName={user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
        userEmail={user?.email}
        userAvatar={user?.user_metadata?.avatar_url}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          items={teacherNavItems.map(item => ({ ...item, id: item.id as Tab }))}
          activeId={activeTab}
          onItemClick={handleTabClick}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <PageContainer>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes>
                <Route path="dashboard" element={
                  <DashboardSection 
                    students={students} 
                    classes={classes} 
                    enrollments={enrollments}
                    attendance={attendance}
                    homework={homework}
                    exams={exams}
                    onViewClass={(cl) => {
                      navigate(`/teacher/classes/${cl.id}`);
                    }}
                  />
                } />
                
                <Route path="classes" element={
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
                    onView={(cl) => navigate(`/teacher/classes/${cl.id}`)}
                    onImportClasses={importClassesBatch}
                    onImportLessons={importLessonsBatch}
                  />
                } />

                <Route path="classes/:id" element={<ClassDetailWrapper />} />

                <Route path="students" element={
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
                } />

                <Route path="attendance" element={
                  <AttendanceSection 
                    students={students}
                    classes={classes}
                    enrollments={enrollments}
                    attendance={attendance}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedClassId={tempClassId}
                    setSelectedClassId={setTempClassId}
                    onUpdate={updateAttendance}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                } />

                <Route path="homework" element={
                  <HomeworkSection 
                    students={students}
                    classes={classes}
                    enrollments={enrollments}
                    homework={homework}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedClassId={tempClassId}
                    setSelectedClassId={setTempClassId}
                    onUpdate={updateHomework}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                } />

                <Route path="exams" element={
                  <ExamsSection 
                    students={students}
                    classes={classes}
                    enrollments={enrollments}
                    exams={exams}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedClassId={tempClassId}
                    setSelectedClassId={setTempClassId}
                    onUpdate={updateExamScore}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                } />

                <Route path="communication" element={
                  <CommunicationSection 
                    students={students} 
                    announcements={announcements} 
                    messages={messages}
                    onAddAnnouncement={addAnnouncement}
                    onAddMessage={addMessage}
                    onDeleteAnnouncement={deleteAnnouncement}
                    onDeleteMessage={deleteMessage}
                  />
                } />

                <Route path="reports" element={
                  <ReportsSection 
                    students={students}
                    classes={classes}
                    enrollments={enrollments}
                    attendance={attendance}
                    homework={homework}
                    exams={exams}
                  />
                } />

                <Route path="profile" element={<ProfileSection />} />

                <Route path="export" element={
                  <ExportSection onExport={() => excelService.exportToExcel(students, classes, enrollments, attendance, homework, exams)} />
                } />

                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
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
