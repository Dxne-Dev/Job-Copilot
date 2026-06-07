import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdminConfig } from './config';

// Serves as administrator client with service_role privileges.
// Keep secure: do not import or use this on client components.
const { url, serviceRoleKey } = getSupabaseAdminConfig();

export const supabaseAdmin = createClient(
  url,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
