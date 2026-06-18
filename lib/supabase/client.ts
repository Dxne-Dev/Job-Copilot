import { createClient as createBrowserSupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './config';

export function createClient() {
  try {
    const { url, anonKey } = getSupabasePublicConfig();
    return createBrowserSupabaseClient(url, anonKey);
  } catch {
    return null;
  }
}
