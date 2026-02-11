// Use Supabase REST API with service key to create tables
const SUPABASE_URL = 'https://nvksevlmgkmnkglrjqus.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52a3NldmxtZ2ttbmtnbHJqcXVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NjIzOCwiZXhwIjoyMDg2MjcyMjM4fQ.3NGHx5Zaa7FFffsDKHSLjb31A3srRd-14Ip_LaPTsHA';

// Import createClient
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function run() {
  console.log('Testing connection...');

  // Test if profiles table exists
  const { data, error } = await supabase.from('profiles').select('id').limit(1);

  if (error) {
    console.log('Error:', error.message);
    console.log('Code:', error.code);

    if (error.code === 'PGRST204' || error.code === '42P01' || error.message.includes('does not exist')) {
      console.log('\nTables do not exist. Cannot create via REST API.');
      console.log('\nPlease run the SQL manually in Supabase Dashboard:');
      console.log('https://supabase.com/dashboard/project/nvksevlmgkmnkglrjqus/sql\n');
      console.log('The SQL is saved in: scripts/schema.sql');
    }
  } else {
    console.log('✅ Profiles table exists!');
    console.log('Data:', data);
  }

  // Check all tables
  const tables = ['properties', 'owners', 'mortgage_records', 'leads', 'lists', 'tasks'];
  console.log('\nChecking tables:');

  for (const table of tables) {
    const { error: tableError } = await supabase.from(table).select('id').limit(1);
    if (tableError) {
      console.log(`  ✗ ${table} - missing`);
    } else {
      console.log(`  ✓ ${table}`);
    }
  }
}

run().catch(console.error);
