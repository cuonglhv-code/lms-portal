import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})

async function checkAndMigrate() {
  console.log('Checking if exam_scores skill columns exist...')

  const { data: columns, error } = await supabase
    .from('exam_scores')
    .select('writing, reading, speaking, listening')
    .limit(1)

  if (!error) {
    console.log('✓ All skill columns already exist!')
    console.log('Sample data:', columns)
    return
  }

  console.log(`⚠ Columns missing: ${error.message}`)
  console.log('')
  
  const projectId = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  
  console.log('='.repeat(70))
  console.log('ACTION REQUIRED: Run this SQL in your Supabase SQL Editor')
  console.log('='.repeat(70))
  console.log('')
  console.log(`👉 Open: https://supabase.com/dashboard/project/${projectId}/sql/new`)
  console.log('')
  console.log('--- COPY ALL SQL BELOW ---')
  console.log('')
  console.log(`ALTER TABLE exam_scores ADD COLUMN IF NOT EXISTS writing DECIMAL(4,2);`)
  console.log(`ALTER TABLE exam_scores ADD COLUMN IF NOT EXISTS reading DECIMAL(4,2);`)
  console.log(`ALTER TABLE exam_scores ADD COLUMN IF NOT EXISTS speaking DECIMAL(4,2);`)
  console.log(`ALTER TABLE exam_scores ADD COLUMN IF NOT EXISTS listening DECIMAL(4,2);`)
  console.log('')
  console.log('--- COPY ALL SQL ABOVE ---')
  console.log('')
  console.log('After running the SQL, the exam score system will support per-skill tracking.')
  console.log('='.repeat(70))
}

checkAndMigrate()
