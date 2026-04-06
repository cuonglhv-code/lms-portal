import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://psfeixnxxjmnpsgnkuhy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZmVpeG54eGptbnBzZ25rdWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0NTkyNiwiZXhwIjoyMDkwODIxOTI2fQ.KxUkNMaqxD68nQ8DN-4_iCCmUS9sMA00yIbSLj_BVAI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Generate proper UUIDs
function genUUID(prefix: string, index: number): string {
  const hex = index.toString(16).padStart(12, '0');
  const suffix = (index * 7 + 11).toString(16).padStart(12, '0');
  return `${prefix.substring(0, 8)}-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${suffix.substring(0, 4)}-${(index * 13 + 17).toString(16).padStart(12, '0')}`;
}

const DATA_DIR = path.join(__dirname);

interface ImportResult {
  table: string;
  success: number;
  failed: number;
  errors: string[];
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const parseRow = (line: string): string[] => {
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
  
  const headers = parseRow(lines[0]).map(h => h.trim());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

async function importTable(tableName: string, fileName: string): Promise<ImportResult> {
  console.log(`\n📤 Importing ${tableName}...`);
  
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return { table: tableName, success: 0, failed: 0, errors: ['File not found'] };
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);
  
  console.log(`   Found ${rows.length} rows to import`);
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cleanRow: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(row)) {
      // Skip empty values
      if (!value || value === '' || value === 'null') continue;
      
      // Try to parse JSON fields
      if ((value.startsWith('[') && value.endsWith(']')) || 
          (value.startsWith('{') && value.endsWith('}'))) {
        try {
          cleanRow[key] = JSON.parse(value.replace(/""/g, '"'));
        } catch {
          cleanRow[key] = value;
        }
      } else if (key === 'id' || key.endsWith('_id')) {
        // Keep UUIDs as-is
        cleanRow[key] = value;
      } else if (key.includes('date') || key.includes('Date') || key.includes('_at') || key === 'session_date') {
        // Handle dates - convert various formats
        if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          cleanRow[key] = value + 'T00:00:00.000Z';
        } else if (value.match(/^\d{2}:\d{2}$/)) {
          // Skip time-only fields
          continue;
        } else {
          cleanRow[key] = value;
        }
      } else {
        cleanRow[key] = value;
      }
    }
    
    try {
      const { error } = await supabaseAdmin
        .from(tableName)
        .insert(cleanRow)
        .select()
        .single();
      
      if (error) {
        failed++;
        if (errors.length < 5 && !error.message.includes('duplicate')) {
          errors.push(`Row ${i + 1}: ${error.message.substring(0, 80)}`);
        }
      } else {
        success++;
      }
    } catch (e) {
      failed++;
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Progress: ${i + 1}/${rows.length}`);
      await sleep(50);
    }
  }
  
  console.log(`   ✅ Success: ${success}, Failed: ${failed}`);
  if (errors.length > 0) {
    console.log(`   ⚠️  Sample errors: ${errors.slice(0, 3).join('\n              ')}`);
  }
  
  return { table: tableName, success, failed, errors };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 IELTS Dummy Data Import to Supabase');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n📡 Connecting to: ${supabaseUrl}`);
  
  const results: ImportResult[] = [];
  
  try {
    // Import in order (dependencies first)
    results.push(await importTable('classes', 'ielts_classes.csv'));
    await sleep(500);
    
    results.push(await importTable('students', 'ielts_students.csv'));
    await sleep(500);
    
    results.push(await importTable('sessions', 'ielts_sessions.csv'));
    await sleep(500);
    
    results.push(await importTable('student_classes', 'ielts_student_classes.csv'));
    await sleep(500);
    
    results.push(await importTable('homework', 'ielts_homework.csv'));
    await sleep(500);
    
    results.push(await importTable('homework_submissions', 'ielts_homework_submissions.csv'));
    await sleep(500);
    
    results.push(await importTable('attendance', 'ielts_attendance.csv'));
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 IMPORT SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    for (const result of results) {
      console.log(`\n${result.table}:`);
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      totalSuccess += result.success;
      totalFailed += result.failed;
    }
    
    console.log('\n───────────────────────────────────────────────────────');
    console.log(`TOTAL: ${totalSuccess} inserted, ${totalFailed} failed`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (totalFailed > 0) {
      console.log('\n⚠️  Some records failed. Check errors above for details.');
      console.log('\n💡 Tip: To clear existing data and re-import, run:');
      console.log(`
-- Delete existing IELTS data
DELETE FROM attendance;
DELETE FROM homework_submissions;
DELETE FROM homework;
DELETE FROM student_classes;
DELETE FROM sessions;
DELETE FROM students;
DELETE FROM classes WHERE name LIKE 'IELTS%';
      `);
    }
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
