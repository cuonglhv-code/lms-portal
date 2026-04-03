import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

import { Button } from '../../../components/common/Button';

interface ExportSectionProps {
  onExport: () => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ onExport }) => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <FileSpreadsheet className="w-10 h-10 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Export Data</h2>
        <p className="text-gray-600 text-lg">
          Download all student data, including attendance summaries, homework completion rates, and the latest exam scores into a single Excel file.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={onExport} className="px-8 py-4 text-lg">
          <Download className="w-6 h-6 mr-3" />
          Download Excel (.xlsx)
        </Button>
      </div>
      <p className="text-sm text-gray-500">
        The export includes all students currently in your database.
      </p>
    </div>
  );
};
