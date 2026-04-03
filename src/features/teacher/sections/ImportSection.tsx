import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Users, BookOpen, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/SharedComponents';

interface ImportResult {
  total: number;
  success: number;
  skipped: number;
  errors: string[];
}

type ImportTab = 'students' | 'lessons' | 'classes';

interface ImportSectionProps {
  onImportStudents: (students: Array<{ name: string; email: string; phone?: string; entryLevel?: string; targetOutcome?: string }>) => Promise<void>;
  onImportLessons: (lessons: Array<{ classId: string; sessionNumber: number; date: string; content: string; homework?: string; isExam?: boolean }>) => Promise<void>;
  onImportClasses: (classes: Array<{ name: string; center?: string; teacher?: string; totalSessions?: number; startingLevel?: string; startDate?: string; startTime?: string; endTime?: string; classDays?: string[]; targetOutcome?: number; sessionsPerWeek?: number }>) => Promise<void>;
  existingStudents: Array<{ id: string; email?: string; name: string }>;
  existingClasses: Array<{ id: string; name: string }>;
}

const TEMPLATES = {
  students: 'full_name,email,mobile,entry_level,target_outcome\nJohn Doe,john@example.com,0123456789,Basic,6.5\nJane Smith,jane@example.com,0987654321,Intermediate,7.5',
  lessons: 'class_id,session_number,date,content,homework,is_exam\ncls-001,1,2024-01-15,Introduction to Grammar,Complete exercise 1-5,false\ncls-001,2,2024-01-17,Vocabulary Building,Learn 20 new words,false\ncls-001,3,2024-01-22,Unit 1 Review,Chapter 1 quiz,true',
  classes: 'name,center,teacher,total_sessions,starting_level,start_date,start_time,end_time,class_days,session_per_week,target_outcome\nIELTS Band 6,Downtown,Sarah Chen,30,B1,2024-01-15,09:00,10:30,Monday;Wednesday,2,6.5',
};

const CSV_HEADERS = {
  students: {
    required: ['full_name', 'email'],
    optional: ['mobile', 'entry_level', 'target_outcome'],
    description: 'Import students with their contact info and learning levels',
  },
  lessons: {
    required: ['class_id', 'session_number', 'date', 'content'],
    optional: ['homework', 'is_exam'],
    description: 'Import lesson plans for existing classes',
  },
  classes: {
    required: ['name'],
    optional: ['center', 'teacher', 'total_sessions', 'starting_level', 'start_date', 'start_time', 'end_time', 'class_days', 'session_per_week', 'target_outcome'],
    description: 'Import classes with schedule and target outcomes',
  },
};

export const ImportSection: React.FC<ImportSectionProps> = ({
  onImportStudents,
  onImportLessons,
  onImportClasses,
  existingStudents,
  existingClasses,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('students');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const downloadTemplate = useCallback((type: ImportTab) => {
    const csvContent = TEMPLATES[type];
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_import_template.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const parseCSV = (content: string): Array<Record<string, string>> => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setResult({ total: 0, success: 0, skipped: 0, errors: ['Only CSV files are supported.'] });
      return;
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      setResult({ total: 0, success: 0, skipped: 0, errors: ['CSV file is empty or missing data rows.'] });
      return;
    }

    setPreview(rows);
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const processImport = async () => {
    if (!preview) return;
    setProcessing(true);

    const errors: string[] = [];
    let success = 0;
    let skipped = 0;

    try {
      if (activeTab === 'students') {
        const students = preview.map((row, idx) => {
          const name = row.full_name || row.name || '';
          const email = (row.email || '').toLowerCase();

          if (!name) {
            errors.push(`Row ${idx + 1}: Name is required.`);
            return null;
          }
          if (existingStudents.some(s => s.email === email)) {
            skipped++;
            return null;
          }

          return {
            name,
            email,
            phone: row.mobile || row.phone || '',
            entryLevel: row.entry_level || row.entryLevel || '',
            targetOutcome: row.target_outcome || row.targetOutcome || '',
          };
        }).filter(Boolean) as Array<{ name: string; email: string; phone?: string; entryLevel?: string; targetOutcome?: string }>;

        if (students.length > 0) {
          await onImportStudents(students);
          success = students.length;
        }
      } else if (activeTab === 'lessons') {
        const lessons = preview.map((row, idx) => {
          const classId = row.class_id || row.classId || '';
          const sessionNumber = parseInt(row.session_number || row.sessionNumber || '0', 10);
          const date = row.date || '';
          const content = row.content || '';

          if (!classId) {
            errors.push(`Row ${idx + 1}: class_id is required.`);
            return null;
          }
          if (!sessionNumber || !date || !content) {
            errors.push(`Row ${idx + 1}: session_number, date, and content are required.`);
            return null;
          }

          const matchedClass = existingClasses.find(c => c.id === classId || c.name.toLowerCase() === classId.toLowerCase());

          return {
            classId: matchedClass?.id || classId,
            sessionNumber,
            date,
            content,
            homework: row.homework || '',
            isExam: (row.is_exam || row.isExam || 'false').toLowerCase() === 'true',
          };
        }).filter(Boolean) as Array<{ classId: string; sessionNumber: number; date: string; content: string; homework?: string; isExam?: boolean }>;

        if (lessons.length > 0) {
          await onImportLessons(lessons);
          success = lessons.length;
        }
      } else if (activeTab === 'classes') {
        const classes = preview.map((row, idx) => {
          const name = row.name || '';
          if (!name) {
            errors.push(`Row ${idx + 1}: Name is required.`);
            return null;
          }

          return {
            name,
            center: row.center || '',
            teacher: row.teacher || '',
            totalSessions: parseInt(row.total_sessions || row.totalSessions || '0', 10) || undefined,
            startingLevel: row.starting_level || row.startingLevel || '',
            startDate: row.start_date || row.startDate || '',
            startTime: row.start_time || row.startTime || '',
            endTime: row.end_time || row.endTime || '',
            classDays: (row.class_days || row.classDays || '').split(';').map(d => d.trim()).filter(Boolean),
            sessionsPerWeek: parseInt(row.session_per_week || row.sessionsPerWeek || '0', 10) || undefined,
            targetOutcome: parseFloat(row.target_outcome || row.targetOutcome || '0') || undefined,
          };
        }).filter(Boolean) as Array<{ name: string; center?: string; teacher?: string; totalSessions?: number; startingLevel?: string; startDate?: string; startTime?: string; endTime?: string; classDays?: string[]; targetOutcome?: number; sessionsPerWeek?: number }>;

        if (classes.length > 0) {
          await onImportClasses(classes);
          success = classes.length;
        }
      }
    } catch (err) {
      errors.push(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setResult({
      total: preview.length,
      success,
      skipped,
      errors,
    });
    setPreview(null);
    setProcessing(false);
  };

  const tabs: { id: ImportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'lessons', label: 'Lesson Plans', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'classes', label: 'Classes', icon: <FileText className="w-4 h-4" /> },
  ];

  const currentHeaders = CSV_HEADERS[activeTab];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
        <p className="text-gray-500 mt-1">Upload CSV files to bulk import students, lesson plans, or classes</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); setPreview(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tabs.find(t => t.id === activeTab)?.label} Import</h3>
            <p className="text-sm text-gray-500 mt-1">{currentHeaders.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate(activeTab)}>
            <Download className="w-4 h-4 mr-1" />
            Template
          </Button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">Required columns:</p>
          <div className="flex flex-wrap gap-1">
            {currentHeaders.required.map(h => (
              <span key={h} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-mono">{h}</span>
            ))}
          </div>
          {currentHeaders.optional.length > 0 && (
            <>
              <p className="text-xs font-medium text-gray-700 mt-2 mb-1">Optional columns:</p>
              <div className="flex flex-wrap gap-1">
                {currentHeaders.optional.map(h => (
                  <span key={h} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">{h}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id={`csv-upload-${activeTab}`}
            onChange={handleFileUpload}
          />
          <label htmlFor={`csv-upload-${activeTab}`} className="cursor-pointer">
            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
              <Upload className="w-7 h-7 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              <span className="text-indigo-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
          </label>
        </div>
      </Card>

      {preview && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview ({preview.length} rows)</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Cancel</Button>
              <Button size="sm" onClick={processImport} loading={processing}>
                <Upload className="w-4 h-4 mr-1" />
                Import {preview.length} rows
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                  {Object.keys(preview[0]).map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                    {Object.values(row).map((val, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 text-gray-700 truncate max-w-[200px]">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && (
            <p className="text-xs text-gray-500 mt-2">Showing first 20 of {preview.length} rows</p>
          )}
        </Card>
      )}

      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Result</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-2xl font-bold">{result.total}</div>
              <div className="text-xs text-gray-500 uppercase">Total Rows</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-700">{result.success}</div>
              <div className="text-xs text-green-600 uppercase">Success</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-yellow-700">{result.skipped}</div>
              <div className="text-xs text-yellow-600 uppercase">Skipped</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
              <div className="text-xs text-red-600 uppercase">Errors</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Error Log
              </h4>
              <div className="max-h-48 overflow-y-auto bg-red-50 p-4 rounded-lg text-xs text-red-800 space-y-1">
                {result.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.length === 0 && result.success > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Successfully imported {result.success} {result.success === 1 ? 'record' : 'records'}!
              </span>
            </div>
          )}

          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>Import More</Button>
          </div>
        </Card>
      )}
    </div>
  );
};
