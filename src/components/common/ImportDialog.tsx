import React, { useState } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from './Button';
import { Card } from './Card';

interface ImportDialogProps {
  type: 'students' | 'lessons' | 'classes';
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  existingItems: Array<{ id: string; email?: string; name: string }>;
}

const TEMPLATES = {
  students: 'full_name,email,mobile,entry_level,target_outcome\nJohn Doe,john@example.com,0123456789,Basic,6.5\nJane Smith,jane@example.com,0987654321,Intermediate,7.5',
  lessons: 'class_id,session_number,date,content,homework,is_exam\ncls-001,1,2024-01-15,Introduction to Grammar,Complete exercise 1-5,false\ncls-001,2,2024-01-17,Vocabulary Building,Learn 20 new words,false',
  classes: 'name,center,teacher,total_sessions,starting_level,start_date,start_time,end_time,class_days,session_per_week,target_outcome\nIELTS Band 6,Downtown,Sarah Chen,30,B1,2024-01-15,09:00,10:30,Monday;Wednesday,2,6.5',
};

export const ImportDialog: React.FC<ImportDialogProps> = ({ type, isOpen, onClose, onImport, existingItems }) => {
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATES[type]], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_import_template.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setResult({ success: 0, errors: ['Only CSV files are supported.'] });
      return;
    }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
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

    setLoading(true);
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length < 2) {
      setResult({ success: 0, errors: ['CSV file is empty.'] });
      setLoading(false);
      return;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const errors: string[] = [];
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      if (type === 'students') {
        const name = row.full_name || row.name || '';
        const email = (row.email || '').toLowerCase();
        if (!name) { errors.push(`Row ${i + 1}: Name required.`); continue; }
        if (existingItems.some(s => s.email === email)) continue;
        data.push({ name, email, phone: row.mobile || '', entryLevel: row.entry_level || '', targetOutcome: row.target_outcome || '' });
      } else if (type === 'lessons') {
        const classId = row.class_id || row.classId || '';
        const sessionNumber = parseInt(row.session_number || '0', 10);
        if (!classId || !sessionNumber || !row.date || !row.content) { errors.push(`Row ${i + 1}: Missing required fields.`); continue; }
        data.push({ classId, sessionNumber, date: row.date, content: row.content, homework: row.homework || '', isExam: (row.is_exam || 'false').toLowerCase() === 'true' });
      } else if (type === 'classes') {
        const name = row.name || '';
        if (!name) { errors.push(`Row ${i + 1}: Name required.`); continue; }
        data.push({ name, center: row.center || '', teacher: row.teacher || '', totalSessions: parseInt(row.total_sessions || '0', 10) || 30, startingLevel: row.starting_level || '', startDate: row.start_date || '', startTime: row.start_time || '', endTime: row.end_time || '', classDays: (row.class_days || '').split(';').map(d => d.trim()).filter(Boolean), sessionsPerWeek: parseInt(row.session_per_week || '0', 10) || 2, targetOutcome: parseFloat(row.target_outcome || '0') || 0, lessonPlan: [], notes: '' });
      }
    }

    try {
      if (data.length > 0) {
        await onImport(data);
      }
      setResult({ success: data.length, errors });
    } catch (err) {
      setResult({ success: 0, errors: [`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`] });
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Import {type === 'students' ? 'Students' : type === 'lessons' ? 'Lesson Plans' : 'Classes'}</h3>
                <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                  <Download className="w-4 h-4 mr-1" /> Download Template
                </Button>

                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
                  <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload CSV</p>
                </label>

                {loading && <p className="text-center text-sm text-gray-500">Processing...</p>}

                {result && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">✓ Imported {result.success} records</p>
                    {result.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto bg-red-50 p-3 rounded text-xs text-red-700">
                        {result.errors.map((e, i) => <div key={i}>{e}</div>)}
                      </div>
                    )}
                    <Button size="sm" onClick={() => setResult(null)} className="w-full">Import More</Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};