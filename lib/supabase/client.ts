import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from './config';

export function createClient() {
  try {
    const { url, anonKey } = getSupabasePublicConfig();
    return createBrowserClient(url, anonKey);
  } catch {
    return null;
  }
}
