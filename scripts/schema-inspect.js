const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// These should be loaded by the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
  console.log('=== SCHEMA INSPECTION REPORT ===\n');

  // Check for specific tables
  console.log('\n=== CRITICAL TABLES CHECK ===');
  const criticalTables = ['potential_clients', 'customer_service_requests', 'customer_followups', 'clients', 'employees', 'accounts', 'bot_settings'];
  
  for (const table of criticalTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ${table}: ❌ DOES NOT EXIST (${error.message})`);
    } else {
      console.log(`  ${table}: ✅ EXISTS (${data?.length ? 'has data' : 'empty'})`);
    }
  }

  // Check potential_clients structure
  console.log('\n=== POTENTIAL_CLIENTS STRUCTURE ===');
  const { data: potentialClients, error: pcError } = await supabase
    .from('potential_clients')
    .select('*')
    .limit(1);

  if (pcError) {
    console.log('ERROR: potential_clients table:', pcError.message);
  } else {
    console.log('Columns:', potentialClients?.length ? Object.keys(potentialClients[0]) : 'No data');
    console.log('New columns needed check:');
    const neededColumns = ['takeover_state', 'assigned_employee_id', 'takeover_employee_id', 'takeover_timestamp', 'whatsapp_account_id', 'takeover_released_by', 'takeover_released_at'];
    const existingColumns = potentialClients?.length ? Object.keys(potentialClients[0]) : [];
    neededColumns.forEach(col => {
      console.log(`  ${col}: ${existingColumns.includes(col) ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    if (potentialClients?.length) {
      console.log('Sample data:', JSON.stringify(potentialClients[0], null, 2));
    }
  }

  // Check customer_service_requests detailed structure
  console.log('\n=== CUSTOMER_SERVICE_REQUESTS DETAILED STRUCTURE ===');
  const { data: csrColumnDetails } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'customer_service_requests')
    .eq('table_schema', 'public')
    .order('ordinal_position');
  
  if (csrColumnDetails?.length) {
    csrColumnDetails.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable}, default: ${c.column_default})`));
    console.log('New columns needed check:');
    const neededCSRCols = ['takeover_employee_id', 'takeover_timestamp', 'takeover_released_by', 'takeover_released_at'];
    const existingCSRCols = csrColumnDetails.map(c => c.column_name);
    neededCSRCols.forEach(col => {
      console.log(`  ${col}: ${existingCSRCols.includes(col) ? '✅ EXISTS' : '❌ MISSING'}`);
    });
  } else {
    console.log('  No columns found - table may not exist');
  }

  // Check accounts structure for new columns
  console.log('\n=== ACCOUNTS NEW COLUMNS CHECK ===');
  const { data: accountColumnDetails } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'accounts')
    .eq('table_schema', 'public')
    .order('ordinal_position');
  
  if (accountColumnDetails?.length) {
    const neededAccountCols = ['is_online', 'last_seen_at'];
    const existingAccountCols = accountColumnDetails.map(c => c.column_name);
    neededAccountCols.forEach(col => {
      console.log(`  ${col}: ${existingAccountCols.includes(col) ? '✅ EXISTS' : '❌ MISSING'}`);
    });
  }

  // Check employees structure
  console.log('\n=== EMPLOYEES STRUCTURE ===');
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('*')
    .limit(1);

  if (empError) {
    console.log('ERROR: employees table:', empError.message);
  } else {
    console.log('Columns:', employees?.length ? Object.keys(employees[0]) : 'No data');
    console.log('ID type:', employees?.length ? typeof employees[0].id : 'unknown');
    if (employees?.length) {
      console.log('Sample data:', JSON.stringify(employees[0], null, 2));
    }
  }

  // Check accounts structure
  console.log('\n=== ACCOUNTS STRUCTURE ===');
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('*')
    .limit(1);

  if (accError) {
    console.log('ERROR: accounts table:', accError.message);
  } else {
    console.log('Columns:', accounts?.length ? Object.keys(accounts[0]) : 'No data');
    if (accounts?.length) {
      console.log('Sample data:', JSON.stringify(accounts[0], null, 2));
    }
  }

  // Check if conversation_messages exists
  console.log('\n=== CONVERSATION_MESSAGES TABLE ===');
  const { data: convMessages, error: convError } = await supabase
    .from('conversation_messages')
    .select('*')
    .limit(1);

  if (convError) {
    console.log('ERROR: conversation_messages table:', convError.message);
    console.log('Status: DOES NOT EXIST (expected)');
  } else {
    console.log('EXISTS: Yes');
    console.log('Columns:', convMessages?.length ? Object.keys(convMessages[0]) : 'No data');
  }

  // Check if notifications exists
  console.log('\n=== NOTIFICATIONS TABLE ===');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (notifError) {
    console.log('ERROR: notifications table:', notifError.message);
    console.log('Status: DOES NOT EXIST (expected)');
  } else {
    console.log('EXISTS: Yes');
    console.log('Columns:', notifications?.length ? Object.keys(notifications[0]) : 'No data');
  }

  // Check RLS status by testing table access
  console.log('\n=== RLS STATUS (via anon key) ===');
  const rlsTables = ['potential_clients', 'customer_service_requests', 'employees', 'accounts'];
  
  for (const table of rlsTables) {
    try {
      const { data } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      console.log(`${table}: ${data !== null ? 'Accessible (RLS allows anon)' : 'Error or no access'}`);
    } catch (e) {
      console.log(`${table}: ERROR - ${e.message}`);
    }
  }

  // Check foreign key constraints
  console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
  const { data: constraints } = await supabase
    .from('information_schema.table_constraints')
    .select('table_name, constraint_name, constraint_type')
    .eq('constraint_type', 'FOREIGN KEY')
    .eq('table_schema', 'public');
  
  if (constraints?.length) {
    constraints.forEach(c => {
      console.log(`  - ${c.table_name}.${c.constraint_name}`);
    });
  } else {
    console.log('  No foreign key constraints found');
  }

  console.log('\n=== MIGRATION STATUS ===');
  console.log('Local migrations:');
  try {
    const files = execSync('ls -1 supabase/migrations/', { encoding: 'utf8' });
    files.split('\n').filter(f => f.endsWith('.sql')).forEach(f => console.log(`  - ${f}`));
  } catch (e) {
    console.log('  Could not list local migrations');
  }

  console.log('\n=== END SCHEMA INSPECTION ===');
}

inspectSchema().catch(console.error);
