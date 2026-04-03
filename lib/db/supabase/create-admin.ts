import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psfeixnxxjmnpsgnkuhy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZmVpeG54eGptbnBzZ25rdWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0NTkyNiwiZXhwIjoyMDkwODIxOTI2fQ.KxUkNMaqxD68nQ8DN-4_iCCmUS9sMA00yIbSLj_BVAI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'cuonglhv@jaxtina.com';
const ADMIN_PASSWORD = 'Jaxtina2026';
const ADMIN_NAME = 'Admin User';

async function createAdminAccount() {
  console.log('Creating admin account...');
  console.log('Email:', ADMIN_EMAIL);
  
  try {
    // 1. Create auth user
    console.log('\n1. Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: ADMIN_NAME,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('Auth user already exists, updating password...');
        // Update password for existing user
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = listData.users.find(u => u.email === ADMIN_EMAIL);
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: {
              display_name: ADMIN_NAME,
              role: 'admin'
            }
          });
          if (updateError) throw updateError;
          console.log('Password updated successfully!');
        }
      } else {
        throw authError;
      }
    } else {
      console.log('Auth user created successfully!');
      console.log('User ID:', authUser.user.id);

      // 2. Create user record in users table
      console.log('\n2. Creating user record in users table...');
      const { error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.user.id,
          email: ADMIN_EMAIL,
          display_name: ADMIN_NAME,
          role: 'admin',
          status: 'active'
        });

      if (userError) {
        if (userError.code === '23505') { // Unique violation
          console.log('User record already exists.');
        } else {
          console.log('User record error:', userError.message);
        }
      } else {
        console.log('User record created successfully!');
      }
    }

    console.log('\n✅ Admin account created successfully!');
    console.log('\nLogin credentials:');
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Password: Jaxtina2026');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

createAdminAccount();
