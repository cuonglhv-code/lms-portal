import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Student } from '../../../types/models';

interface ImportSectionProps {
  onImport: (data: Omit<Student, 'id' | 'createdAt'>) => void;
  existingStudents: Student[];
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onImport, existingStudents }) => {
  const [importSummary, setImportSummary] = useState<{ total: number; success: number; skipped: number; errors: number } | null>(null);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length < 2) {
        setErrorLog(['CSV file is empty or missing headers.']);
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const nameIdx = headers.indexOf('full_name');
      const emailIdx = headers.indexOf('email');
      const mobileIdx = headers.indexOf('mobile');
      const entryIdx = headers.indexOf('entry_level');
      const targetIdx = headers.indexOf('target_outcome');

      if (nameIdx === -1 || emailIdx === -1 || mobileIdx === -1) {
        setErrorLog(['Missing required headers: full_name, email, mobile (Optional: entry_level, target_outcome)']);
        return;
      }

      let success = 0;
      let skipped = 0;
      let errors = 0;
      const newErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim());
        const name = row[nameIdx];
        const email = row[emailIdx];
        const mobile = row[mobileIdx];
        const entryLevel = entryIdx !== -1 ? row[entryIdx] : 'Imported';
        const targetOutcome = targetIdx !== -1 ? row[targetIdx] : 'TBD';

        if (!name) {
          errors++;
          newErrors.push(`Row ${i + 1}: Name is required.`);
          continue;
        }

        if (existingStudents.some(s => s.email === email)) {
          skipped++;
          continue;
        }

        try {
          onImport({
            name,
            email: email || '',
            phone: mobile || '',
            entryLevel,
            targetOutcome,
          });
          success++;
        } catch (err) {
          errors++;
          newErrors.push(`Row ${i + 1}: Failed to import.`);
        }
      }

      setImportSummary({ total: lines.length - 1, success, skipped, errors });
      setErrorLog(newErrors);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bulk Import Students</h2>
          <p className="text-gray-600">Upload a CSV file to add multiple students at once.</p>
        </div>
        <Button 
          variant="secondary" 
          className="mx-auto"
          onClick={() => {
            const csvContent = "full_name,email,mobile,entry_level,target_outcome\nJohn Doe,john@example.com,0123456789,Basic,6.5";
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "student_import_template.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Card className="p-8 border-2 border-dashed border-gray-300 bg-gray-50 text-center">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          id="csv-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload" className="cursor-pointer space-y-4 block">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Plus className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <span className="text-indigo-600 font-bold">Click to upload</span> or drag and drop
            <p className="text-xs text-gray-500 mt-1">Supported columns: full_name, email, mobile, entry_level, target_outcome</p>
          </div>
        </label>
      </Card>

      {importSummary && (
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-bold mb-4">Import Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-2xl font-bold">{importSummary.total}</div>
              <div className="text-xs text-gray-500 uppercase">Total Rows</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-700">{importSummary.success}</div>
              <div className="text-xs text-green-600 uppercase">Success</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-yellow-700">{importSummary.skipped}</div>
              <div className="text-xs text-yellow-600 uppercase">Skipped</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-700">{importSummary.errors}</div>
              <div className="text-xs text-red-600 uppercase">Errors</div>
            </div>
          </div>

          {errorLog.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-red-600 mb-2">Error Log</h4>
              <div className="max-h-40 overflow-y-auto bg-red-50 p-4 rounded-lg text-xs text-red-800 space-y-1">
                {errorLog.map((err, i) => <div key={i}>{err}</div>)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
