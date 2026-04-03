import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'string';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'string';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const DUMMY_PASSWORD = 'Test123!';

const centers = [
  { name: 'Downtown Learning Center', address: '123 Main Street, Downtown', phone: '555-0100', email: 'downtown@jaxtina.com' },
  { name: 'Westside Academy', address: '456 West Avenue, Westside', phone: '555-0200', email: 'westside@jaxtina.com' },
  { name: 'North Hills Campus', address: '789 North Road, North Hills', phone: '555-0300', email: 'north@jaxtina.com' },
];

const teachers = [
  { email: 'admin@jaxtina.com', display_name: 'Admin User', role: 'admin' },
  { email: 'sarah.chen@jaxtina.com', display_name: 'Sarah Chen', role: 'teacher' },
  { email: 'michael.johnson@jaxtina.com', display_name: 'Michael Johnson', role: 'teacher' },
  { email: 'emily.davis@jaxtina.com', display_name: 'Emily Davis', role: 'teacher' },
  { email: 'david.wilson@jaxtina.com', display_name: 'David Wilson', role: 'teacher' },
];

const studentNames = [
  { name: 'Alex Thompson', parent: 'Jennifer Thompson', parentEmail: 'j.thompson@email.com' },
  { name: 'Emma Rodriguez', parent: 'Maria Rodriguez', parentEmail: 'm.rodriguez@email.com' },
  { name: 'James Kim', parent: 'David Kim', parentEmail: 'd.kim@email.com' },
  { name: 'Sophia Patel', parent: 'Anita Patel', parentEmail: 'a.patel@email.com' },
  { name: 'Lucas Martinez', parent: 'Carlos Martinez', parentEmail: 'c.martinez@email.com' },
  { name: 'Olivia Brown', parent: 'Lisa Brown', parentEmail: 'l.brown@email.com' },
  { name: 'Noah Garcia', parent: 'Rosa Garcia', parentEmail: 'r.garcia@email.com' },
  { name: 'Ava Lee', parent: 'Kevin Lee', parentEmail: 'k.lee@email.com' },
  { name: 'Ethan Wilson', parent: 'Sarah Wilson', parentEmail: 's.wilson@email.com' },
  { name: 'Isabella Nguyen', parent: 'Hung Nguyen', parentEmail: 'h.nguyen@email.com' },
  { name: 'Mason Taylor', parent: 'Angela Taylor', parentEmail: 'a.taylor@email.com' },
  { name: 'Mia Anderson', parent: 'Mark Anderson', parentEmail: 'm.anderson@email.com' },
  { name: 'Liam Thomas', parent: 'Karen Thomas', parentEmail: 'k.thomas@email.com' },
  { name: 'Charlotte Jackson', parent: 'Robert Jackson', parentEmail: 'r.jackson@email.com' },
  { name: 'Benjamin White', parent: 'Patricia White', parentEmail: 'p.white@email.com' },
  { name: 'Amelia Harris', parent: 'James Harris', parentEmail: 'j.harris@email.com' },
];

const subjects = ['Mathematics', 'English', 'Science', 'History', 'Art', 'Music'];
const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

const classNames = [
  'Advanced Mathematics', 'Basic Arithmetic', 'Algebra Fundamentals', 'Geometry Basics',
  'Reading Comprehension', 'Creative Writing', 'Grammar Essentials', 'Public Speaking',
  'Biology 101', 'Chemistry Basics', 'Physics Introduction', 'Environmental Science',
  'World History', 'American History', 'Geography', 'Civics',
  'Drawing & Sketching', 'Digital Art', 'Art History', 'Crafts',
  'Music Theory', 'Piano Basics', 'Guitar for Beginners', 'Chorus',
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createAuthUser(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.log(`Auth user ${email}: ${error.message}`);
      return null;
    }
    console.log(`Created auth user: ${email}`);
    return data.user;
  } catch (e) {
    console.log(`Error creating auth user ${email}`);
    return null;
  }
}

async function seed() {
  console.log('Starting seed process...\n');

  // Create centers
  console.log('Creating centers...');
  const createdCenters: string[] = [];
  for (const center of centers) {
    const { data, error } = await supabaseAdmin
      .from('centers')
      .insert({ ...center, status: 'active' })
      .select('id')
      .single();
    if (error) {
      console.log(`Center ${center.name}: ${error.message}`);
    } else {
      createdCenters.push(data.id);
      console.log(`Created center: ${center.name}`);
    }
    await sleep(100);
  }
  console.log(`Created ${createdCenters.length} centers\n`);

  // Create teacher/admin users in auth and users table
  console.log('Creating teachers/admins...');
  const createdTeachers: string[] = [];
  for (const teacher of teachers) {
    const authUser = await createAuthUser(teacher.email, DUMMY_PASSWORD);
    await sleep(200);
    
    if (authUser) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authUser.id,
          email: teacher.email,
          display_name: teacher.display_name,
          role: teacher.role,
          status: 'active',
        })
        .select('id')
        .single();
      if (error) {
        console.log(`User ${teacher.email}: ${error.message}`);
      } else {
        createdTeachers.push(data.id);
        console.log(`Created user: ${teacher.display_name} (${teacher.role})`);
      }
    }
    await sleep(100);
  }
  console.log(`Created ${createdTeachers.length} users\n`);

  // Create students in auth and students table
  console.log('Creating students...');
  const createdStudents: string[] = [];
  for (const student of studentNames) {
    const authUser = await createAuthUser(student.parentEmail, DUMMY_PASSWORD);
    await sleep(200);
    
    if (authUser) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .insert({
          auth_id: authUser.id,
          email: student.parentEmail,
          display_name: student.name,
          parent_name: student.parent,
          parent_email: student.parentEmail,
          status: 'active',
        })
        .select('id')
        .single();
      if (error) {
        console.log(`Student ${student.name}: ${error.message}`);
      } else {
        createdStudents.push(data.id);
        console.log(`Created student: ${student.name}`);
      }
    }
    await sleep(100);
  }
  console.log(`Created ${createdStudents.length} students\n`);

  // Create classes
  console.log('Creating classes...');
  const createdClasses: string[] = [];
  const teacherIds = createdTeachers.filter((_, i) => i > 0); // Exclude admin
  
  for (let i = 0; i < 12; i++) {
    const teacherId = teacherIds[i % teacherIds.length];
    const centerId = createdCenters[i % createdCenters.length];
    const subject = subjects[i % subjects.length];
    const grade = grades[Math.floor(i / 2) % grades.length];
    const className = classNames[i % classNames.length];
    
    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        name: `${grade} ${className}`,
        subject,
        grade_level: grade,
        teacher_id: teacherId,
        center_id: centerId,
        max_students: 20,
        status: 'active',
        schedule: JSON.stringify([
          { day: 'Monday', startTime: '09:00', endTime: '10:30' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        ]),
      })
      .select('id')
      .single();
    if (error) {
      console.log(`Class ${className}: ${error.message}`);
    } else {
      createdClasses.push(data.id);
      console.log(`Created class: ${grade} ${className}`);
    }
    await sleep(100);
  }
  console.log(`Created ${createdClasses.length} classes\n`);

  // Enroll students in classes
  console.log('Enrolling students in classes...');
  let enrollmentCount = 0;
  for (const studentId of createdStudents) {
    for (let i = 0; i < 3; i++) {
      const classId = createdClasses[(createdStudents.indexOf(studentId) + i) % createdClasses.length];
      const { error } = await supabaseAdmin
        .from('student_classes')
        .insert({
          student_id: studentId,
          class_id: classId,
          status: 'active',
        });
      if (!error) enrollmentCount++;
    }
    await sleep(50);
  }
  console.log(`Created ${enrollmentCount} enrollments\n`);

  // Create homework
  console.log('Creating homework...');
  const createdHomework: string[] = [];
  for (const classId of createdClasses.slice(0, 6)) {
    for (let w = 0; w < 3; w++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7 + w * 7);
      
      const { data, error } = await supabaseAdmin
        .from('homework')
        .insert({
          class_id: classId,
          title: `Homework ${w + 1}: Chapter ${w + 1} Practice`,
          description: `Complete exercises from chapter ${w + 1}. Show all work.`,
          due_date: dueDate.toISOString(),
          total_points: 100,
          status: 'active',
        })
        .select('id')
        .single();
      if (!error && data) {
        createdHomework.push(data.id);
      }
    }
    await sleep(100);
  }
  console.log(`Created ${createdHomework.length} homework assignments\n`);

  // Create exam scores and homework submissions
  console.log('Creating submissions and scores...');
  for (const studentId of createdStudents.slice(0, 8)) {
    // Homework submissions
    for (const homeworkId of createdHomework.slice(0, 6)) {
      const points = Math.floor(Math.random() * 30) + 70; // 70-100
      const { error } = await supabaseAdmin
        .from('homework_submissions')
        .insert({
          homework_id: homeworkId,
          student_id: studentId,
          content: 'I completed all the exercises as instructed.',
          points_earned: points,
          feedback: points >= 90 ? 'Excellent work!' : points >= 80 ? 'Good job!' : 'Keep practicing!',
          status: 'graded',
          graded_at: new Date().toISOString(),
        });
      await sleep(50);
    }

    // Exam scores
    for (let e = 0; e < 2; e++) {
      const score = Math.floor(Math.random() * 35) + 65; // 65-100
      const { error } = await supabaseAdmin
        .from('exam_scores')
        .insert({
          exam_id: createdHomework[e], // Use homework ID as placeholder
          student_id: studentId,
          score,
          percentage: score,
          grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
        });
      await sleep(50);
    }
  }
  console.log('Created submissions and scores\n');

  // Create sessions
  console.log('Creating sessions...');
  for (const classId of createdClasses.slice(0, 6)) {
    for (let s = 0; s < 4; s++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - 28 + s * 7);
      
      await supabaseAdmin
        .from('sessions')
        .insert({
          class_id: classId,
          title: `Week ${s + 1}: Lesson ${s + 1}`,
          content: `Introduction to key concepts for this week.`,
          session_date: sessionDate.toISOString(),
          duration_minutes: 90,
          notes: 'Covered all planned topics.',
        });
    }
    await sleep(50);
  }
  console.log('Created sessions\n');

  // Create attendance records
  console.log('Creating attendance records...');
  let attendanceCount = 0;
  for (const studentId of createdStudents.slice(0, 10)) {
    for (let d = 0; d < 20; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const { error } = await supabaseAdmin
        .from('attendance')
        .insert({
          student_id: studentId,
          class_id: createdClasses[createdStudents.indexOf(studentId) % createdClasses.length],
          date: date.toISOString().split('T')[0],
          status,
        });
      if (!error) attendanceCount++;
    }
    await sleep(50);
  }
  console.log(`Created ${attendanceCount} attendance records\n`);

  // Create announcements
  console.log('Creating announcements...');
  const adminId = createdTeachers[0];
  await supabaseAdmin.from('messages').insert({
    sender_id: adminId,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'Welcome to Jaxtina Learning Portal!',
    content: 'Welcome to our education platform! We are excited to have you here. Please explore all the features and don\'t hesitate to reach out if you have any questions.',
    message_type: 'announcement',
  });
  
  await supabaseAdmin.from('messages').insert({
    sender_id: adminId,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'Important: Schedule Change Notice',
    content: 'Please note that there will be a schedule change next week due to the holiday. Classes will resume on Monday.',
    message_type: 'announcement',
  });
  
  await supabaseAdmin.from('messages').insert({
    sender_id: adminId,
    sender_type: 'user',
    recipient_id: 'all',
    recipient_type: 'all',
    title: 'New Learning Resources Available',
    content: 'We have added new learning resources to the portal. Check out the Materials section for supplementary materials.',
    message_type: 'announcement',
  });
  console.log('Created announcements\n');

  console.log('========================================');
  console.log('SEED COMPLETE!');
  console.log('========================================');
  console.log('\nTest Accounts:');
  console.log('--------------');
  console.log('Admin: admin@jaxtina.com / Test123!');
  console.log('Teacher: sarah.chen@jaxtina.com / Test123!');
  console.log('Student: j.thompson@email.com / Test123!');
  console.log('------------------------------------------\n');
}

seed().catch(console.error);
