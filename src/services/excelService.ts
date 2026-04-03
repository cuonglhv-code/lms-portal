import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Student, Class, Enrollment, Attendance, Homework, ExamScore } from '../types/models';

export const excelService = {
  exportToExcel: (
    students: Student[],
    classes: Class[],
    enrollments: Enrollment[],
    attendance: Attendance[],
    homework: Homework[],
    exams: ExamScore[]
  ) => {
    const studentData = students.map(student => {
      const studentAttendance = attendance.filter(a => a.studentId === student.id);
      const studentHomework = homework.filter(h => h.studentId === student.id);
      const studentExams = exams.filter(e => e.studentId === student.id);

      const latestExam = [...studentExams].sort((a, b) => b.date.localeCompare(a.date))[0];
      const attRate = studentAttendance.length > 0 
        ? Math.round((studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length / studentAttendance.length) * 100) 
        : 100;

      return {
        'Student ID': student.id,
        'Student Name': student.name,
        'Email': student.email || 'N/A',
        'Entry Level': student.entryLevel,
        'Target Outcome': student.targetOutcome,
        'Parent Name': student.parentName || 'N/A',
        'Phone': student.phone || 'N/A',
        'Attendance Rate': `${attRate}%`,
        'Present': studentAttendance.filter(a => a.status === 'present').length,
        'Absent': studentAttendance.filter(a => a.status === 'absent').length,
        'Late': studentAttendance.filter(a => a.status === 'late').length,
        'Homework Submitted': studentHomework.filter(h => h.status === 'yes').length,
        'Homework Missing': studentHomework.filter(h => h.status === 'no').length,
        'Latest Writing': latestExam?.writing || 0,
        'Latest Reading': latestExam?.reading || 0,
        'Latest Speaking': latestExam?.speaking || 0,
        'Latest Listening': latestExam?.listening || 0,
      };
    });

    const classData = classes.map(c => {
      const classEnrollments = enrollments.filter(e => e.classId === c.id);
      return {
        'Class Name': c.name,
        'Center': c.center,
        'Teacher': c.teacher,
        'Total Sessions': c.totalSessions,
        'Starting Level': c.startingLevel,
        'Target Outcome': c.targetOutcome,
        'Start Date': c.startDate,
        'Class Days': (c.classDays || []).join(', '),
        'Start Time': c.startTime,
        'End Time': c.endTime,
        'Student Count': classEnrollments.length,
        'Notes': c.notes || ''
      };
    });

    const wb = XLSX.utils.book_new();
    const wsStudents = XLSX.utils.json_to_sheet(studentData);
    const wsClasses = XLSX.utils.json_to_sheet(classData);
    
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Students Summary');
    XLSX.utils.book_append_sheet(wb, wsClasses, 'Classes Overview');
    
    XLSX.writeFile(wb, `Jaxtina_LMS_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }
};
