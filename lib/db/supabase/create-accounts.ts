import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials.');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PASSWORD = 'Jaxtina2026';

const accounts = [
  { email: 'sarah.chen@jaxtina.com', name: 'Sarah Chen', role: 'teacher' },
  { email: 'michael.johnson@jaxtina.com', name: 'Michael Johnson', role: 'teacher' },
  { email: 'emily.davis@jaxtina.com', name: 'Emily Davis', role: 'teacher' },
  { email: 'david.wilson@jaxtina.com', name: 'David Wilson', role: 'teacher' },
  { email: 'j.thompson@email.com', name: 'Alex Thompson', role: 'student' },
  { email: 'm.rodriguez@email.com', name: 'Emma Rodriguez', role: 'student' },
  { email: 'd.kim@email.com', name: 'James Kim', role: 'student' },
  { email: 'a.patel@email.com', name: 'Sophia Patel', role: 'student' },
  { email: 'c.martinez@email.com', name: 'Lucas Martinez', role: 'student' },
  { email: 'l.brown@email.com', name: 'Olivia Brown', role: 'student' },
];

async function createAccounts() {
  console.log('Creating accounts...\n');
  console.log(`Password for all accounts: ${PASSWORD}\n`);

  for (const account of accounts) {
    try {
      console.log(`Creating ${account.role}: ${account.email}...`);
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          display_name: account.name,
          role: account.role
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`  User already exists, updating password...`);
          
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData.users.find(u => u.email === account.email);
          
          if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: PASSWORD,
              email_confirm: true,
            });
            console.log(`  Password updated!`);
          }
        } else {
          console.log(`  Error: ${authError.message}`);
        }
      } else {
        console.log(`  Created! User ID: ${authUser.user.id}`);

        // Add to users/students table
        if (account.role === 'teacher') {
          await supabase.from('users').upsert({
            auth_id: authUser.user.id,
            email: account.email,
            display_name: account.name,
            role: 'teacher',
            status: 'active'
          }, { onConflict: 'auth_id' });
          console.log(`  Added to users table`);
        } else {
          await supabase.from('students').upsert({
            auth_id: authUser.user.id,
            email: account.email,
            display_name: account.name,
            parent_email: account.email,
            status: 'active'
          }, { onConflict: 'auth_id' });
          console.log(`  Added to students table`);
        }
      }
      
      console.log('');
    } catch (error: any) {
      console.error(`Error creating ${account.email}: ${error.message}\n`);
    }
  }

  console.log('========================================');
  console.log('All accounts created successfully!');
  console.log('========================================');
  console.log('\nTest Credentials:');
  console.log('----------------');
  console.log('Admin:    cuonglhv@jaxtina.com / Jaxtina2026');
  console.log('Teacher:  sarah.chen@jaxtina.com / Jaxtina2026');
  console.log('Student:  j.thompson@email.com / Jaxtina2026');
  console.log('------------------------------------------\n');
}

createAccounts();
