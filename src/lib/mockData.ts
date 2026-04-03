// Mock data for local development without Supabase
// This module provides demo data for testing all three portals

export interface MockUser {
  id: string;
  auth_id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'invited' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface MockStudent {
  id: string;
  auth_id: string;
  email: string;
  display_name: string;
  phone?: string;
  parent_name?: string;
  parent_email?: string;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'inactive' | 'graduated';
  created_at: string;
  updated_at: string;
}

export interface MockCenter {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MockClass {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  teacher_id?: string;
  center_id?: string;
  schedule: Array<{ day: string; startTime: string; endTime: string }>;
  max_students: number;
  status: 'active' | 'archived' | 'draft';
  created_at: string;
  updated_at: string;
  teacher?: MockUser;
  center?: MockCenter;
  student_count?: number;
}

export interface MockSession {
  id: string;
  class_id: string;
  title: string;
  content?: string;
  session_date: string;
  duration_minutes: number;
  homework_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MockHomework {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  content?: string;
  attachments: any[];
  due_date?: string;
  total_points: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'draft' | 'archived';
}

export interface MockExam {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  exam_date?: string;
  duration_minutes?: number;
  total_points: number;
  exam_type: 'test' | 'quiz' | 'midterm' | 'final' | 'project';
  created_by?: string;
  created_at: string;
  updated_at: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'archived';
}

export interface MockAttendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MockMessage {
  id: string;
  sender_id?: string;
  sender_type: 'user' | 'student' | 'system';
  recipient_id: string;
  recipient_type: 'student' | 'class' | 'all';
  title?: string;
  content: string;
  message_type: 'direct' | 'announcement' | 'system';
  class_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Generate UUIDs
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

// Mock Centers
export const mockCenters: MockCenter[] = [
  {
    id: uuid(),
    name: 'Downtown Learning Center',
    address: '123 Main Street, Downtown',
    phone: '555-0100',
    email: 'downtown@jaxtina.com',
    status: 'active',
    created_at: pastDate(180),
    updated_at: pastDate(30),
  },
  {
    id: uuid(),
    name: 'Westside Academy',
    address: '456 West Avenue, Westside',
    phone: '555-0200',
    email: 'westside@jaxtina.com',
    status: 'active',
    created_at: pastDate(180),
    updated_at: pastDate(30),
  },
  {
    id: uuid(),
    name: 'North Hills Campus',
    address: '789 North Road, North Hills',
    phone: '555-0300',
    email: 'north@jaxtina.com',
    status: 'active',
    created_at: pastDate(180),
    updated_at: pastDate(30),
  },
];

// Mock Users (Teachers/Admins)
export const mockUsers: MockUser[] = [
  {
    id: uuid(),
    auth_id: uuid(),
    email: 'admin@jaxtina.com',
    display_name: 'Admin User',
    role: 'admin',
    status: 'active',
    created_at: pastDate(365),
    updated_at: pastDate(1),
  },
  {
    id: uuid(),
    auth_id: uuid(),
    email: 'sarah.chen@jaxtina.com',
    display_name: 'Sarah Chen',
    role: 'teacher',
    phone: '555-1001',
    status: 'active',
    created_at: pastDate(300),
    updated_at: pastDate(5),
  },
  {
    id: uuid(),
    auth_id: uuid(),
    email: 'michael.johnson@jaxtina.com',
    display_name: 'Michael Johnson',
    role: 'teacher',
    phone: '555-1002',
    status: 'active',
    created_at: pastDate(280),
    updated_at: pastDate(3),
  },
  {
    id: uuid(),
    auth_id: uuid(),
    email: 'emily.davis@jaxtina.com',
    display_name: 'Emily Davis',
    role: 'teacher',
    phone: '555-1003',
    status: 'active',
    created_at: pastDate(260),
    updated_at: pastDate(7),
  },
  {
    id: uuid(),
    auth_id: uuid(),
    email: 'david.wilson@jaxtina.com',
    display_name: 'David Wilson',
    role: 'teacher',
    phone: '555-1004',
    status: 'active',
    created_at: pastDate(240),
    updated_at: pastDate(2),
  },
];

// Mock Students
export const mockStudents: MockStudent[] = [
  { id: uuid(), auth_id: uuid(), email: 'j.thompson@email.com', display_name: 'Alex Thompson', parent_name: 'Jennifer Thompson', parent_email: 'j.thompson@email.com', status: 'active', created_at: pastDate(150), updated_at: pastDate(5) },
  { id: uuid(), auth_id: uuid(), email: 'm.rodriguez@email.com', display_name: 'Emma Rodriguez', parent_name: 'Maria Rodriguez', parent_email: 'm.rodriguez@email.com', status: 'active', created_at: pastDate(145), updated_at: pastDate(3) },
  { id: uuid(), auth_id: uuid(), email: 'd.kim@email.com', display_name: 'James Kim', parent_name: 'David Kim', parent_email: 'd.kim@email.com', status: 'active', created_at: pastDate(140), updated_at: pastDate(7) },
  { id: uuid(), auth_id: uuid(), email: 'a.patel@email.com', display_name: 'Sophia Patel', parent_name: 'Anita Patel', parent_email: 'a.patel@email.com', status: 'active', created_at: pastDate(135), updated_at: pastDate(2) },
  { id: uuid(), auth_id: uuid(), email: 'c.martinez@email.com', display_name: 'Lucas Martinez', parent_name: 'Carlos Martinez', parent_email: 'c.martinez@email.com', status: 'active', created_at: pastDate(130), updated_at: pastDate(4) },
  { id: uuid(), auth_id: uuid(), email: 'l.brown@email.com', display_name: 'Olivia Brown', parent_name: 'Lisa Brown', parent_email: 'l.brown@email.com', status: 'active', created_at: pastDate(125), updated_at: pastDate(6) },
  { id: uuid(), auth_id: uuid(), email: 'r.garcia@email.com', display_name: 'Noah Garcia', parent_name: 'Rosa Garcia', parent_email: 'r.garcia@email.com', status: 'active', created_at: pastDate(120), updated_at: pastDate(1) },
  { id: uuid(), auth_id: uuid(), email: 'k.lee@email.com', display_name: 'Ava Lee', parent_name: 'Kevin Lee', parent_email: 'k.lee@email.com', status: 'active', created_at: pastDate(115), updated_at: pastDate(8) },
  { id: uuid(), auth_id: uuid(), email: 's.wilson@email.com', display_name: 'Ethan Wilson', parent_name: 'Sarah Wilson', parent_email: 's.wilson@email.com', status: 'active', created_at: pastDate(110), updated_at: pastDate(3) },
  { id: uuid(), auth_id: uuid(), email: 'h.nguyen@email.com', display_name: 'Isabella Nguyen', parent_name: 'Hung Nguyen', parent_email: 'h.nguyen@email.com', status: 'active', created_at: pastDate(105), updated_at: pastDate(2) },
  { id: uuid(), auth_id: uuid(), email: 'a.taylor@email.com', display_name: 'Mason Taylor', parent_name: 'Angela Taylor', parent_email: 'a.taylor@email.com', status: 'active', created_at: pastDate(100), updated_at: pastDate(5) },
  { id: uuid(), auth_id: uuid(), email: 'm.anderson@email.com', display_name: 'Mia Anderson', parent_name: 'Mark Anderson', parent_email: 'm.anderson@email.com', status: 'active', created_at: pastDate(95), updated_at: pastDate(4) },
];

// Mock Classes
const teachers = mockUsers.filter(u => u.role === 'teacher');
const subjects = ['Mathematics', 'English', 'Science', 'History'];
const grades = ['Grade 3', 'Grade 4', 'Grade 5'];

export const mockClasses: MockClass[] = [];

for (let i = 0; i < 12; i++) {
  const teacher = teachers[i % teachers.length];
  const center = mockCenters[i % mockCenters.length];
  const subject = subjects[i % subjects.length];
  const grade = grades[Math.floor(i / 4) % grades.length];
  
  mockClasses.push({
    id: uuid(),
    name: `${grade} ${subject}`,
    subject,
    grade_level: grade,
    teacher_id: teacher.id,
    center_id: center.id,
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
    ],
    max_students: 20,
    status: 'active',
    created_at: pastDate(180 - i * 5),
    updated_at: pastDate(10 - i),
    teacher,
    center,
    student_count: 8 + Math.floor(Math.random() * 8),
  });
}

// Mock Sessions
export const mockSessions: MockSession[] = [];
for (const cls of mockClasses.slice(0, 6)) {
  for (let w = 0; w < 4; w++) {
    mockSessions.push({
      id: uuid(),
      class_id: cls.id,
      title: `Week ${w + 1}: ${['Introduction', 'Fundamentals', 'Practice', 'Review'][w]}`,
      content: `Lesson content for ${cls.name} - Week ${w + 1}`,
      session_date: pastDate(21 - w * 7),
      duration_minutes: 90,
      notes: 'All topics covered successfully.',
      created_by: cls.teacher_id,
      created_at: pastDate(28 - w * 7),
      updated_at: pastDate(28 - w * 7),
    });
  }
}

// Mock Homework
export const mockHomework: MockHomework[] = [];
for (const cls of mockClasses.slice(0, 6)) {
  for (let h = 0; h < 3; h++) {
    mockHomework.push({
      id: uuid(),
      class_id: cls.id,
      title: `Chapter ${h + 1} Exercises`,
      description: `Complete exercises from chapter ${h + 1}. Show all work.`,
      content: 'Chapter content here...',
      attachments: [],
      due_date: futureDate(7 + h * 7),
      total_points: 100,
      created_by: cls.teacher_id,
      created_at: pastDate(14 + h * 7),
      updated_at: pastDate(14 + h * 7),
      status: 'active',
    });
  }
}

// Mock Exams
export const mockExams: MockExam[] = [];
for (const cls of mockClasses.slice(0, 4)) {
  mockExams.push({
    id: uuid(),
    class_id: cls.id,
    title: `${cls.name} - Midterm Exam`,
    description: 'Comprehensive midterm examination',
    exam_date: pastDate(-14), // 2 weeks from now
    duration_minutes: 120,
    total_points: 100,
    exam_type: 'midterm',
    created_by: cls.teacher_id,
    created_at: pastDate(30),
    updated_at: pastDate(7),
    status: 'scheduled',
  });
}

// Mock Attendance
export const mockAttendance: MockAttendance[] = [];
for (const student of mockStudents) {
  for (let d = 0; d < 20; d++) {
    const statuses: ('present' | 'absent' | 'late' | 'excused')[] = ['present', 'present', 'present', 'present', 'absent', 'late'];
    mockAttendance.push({
      id: uuid(),
      student_id: student.id,
      class_id: mockClasses[0].id,
      date: pastDate(d).split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: pastDate(d),
      updated_at: pastDate(d),
    });
  }
}

// Mock Messages/Announcements
export const mockMessages: MockMessage[] = [
  {
    id: uuid(),
    sender_id: mockUsers[0].id,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'Welcome to Jaxtina Learning Portal!',
    content: 'Welcome to our education platform! We are excited to have you here. Please explore all the features and don\'t hesitate to reach out if you have any questions.',
    message_type: 'announcement',
    is_read: false,
    created_at: pastDate(7),
  },
  {
    id: uuid(),
    sender_id: mockUsers[0].id,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'Important: Schedule Change Notice',
    content: 'Please note that there will be a schedule change next week due to the holiday. Classes will resume on Monday.',
    message_type: 'announcement',
    is_read: false,
    created_at: pastDate(3),
  },
  {
    id: uuid(),
    sender_id: mockUsers[0].id,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'New Learning Resources Available',
    content: 'We have added new learning resources to the portal. Check out the Materials section for supplementary materials.',
    message_type: 'announcement',
    is_read: false,
    created_at: pastDate(1),
  },
];

// Dashboard Stats
export const mockDashboardStats = {
  totalStudents: mockStudents.length,
  totalTeachers: teachers.length,
  totalClasses: mockClasses.length,
  totalCenters: mockCenters.length,
  newStudentsThisMonth: 5,
  newStudentsTrend: 15,
  attendanceRate: 87,
  homeworkCompletionRate: 92,
};

// Student enrollments (class_id -> student_ids)
export const mockEnrollments: Array<{ student_id: string; class_id: string }> = [];
for (let i = 0; i < mockStudents.length; i++) {
  const student = mockStudents[i];
  for (let j = 0; j < 3; j++) {
    const classId = mockClasses[(i + j) % mockClasses.length].id;
    if (!mockEnrollments.some(e => e.student_id === student.id && e.class_id === classId)) {
      mockEnrollments.push({ student_id: student.id, class_id: classId });
    }
  }
}

console.log('[MockData] Demo data initialized');
console.log('[MockData] Test accounts:');
console.log('  Admin: admin@jaxtina.com');
console.log('  Teacher: sarah.chen@jaxtina.com');
console.log('  Student: j.thompson@email.com');
console.log('  (Any password will work in demo mode)');
