import { createClient as createBrowserSupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function createClient() {
  try {
    const { url, anonKey } = getSupabasePublicConfig();
    if (!browserClient) {
      browserClient = createBrowserSupabaseClient(url, anonKey);
    }
    return browserClient;
  } catch {
    return null;
  }
}
