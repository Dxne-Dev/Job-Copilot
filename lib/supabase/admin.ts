import { createClient } from '@supabase/supabase-js';

// Serves as administrator client with service_role privileges.
// Keep secure: do not import or use this on client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_role_key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
