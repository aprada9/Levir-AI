import { SupabaseClient } from '@supabase/supabase-js';

export async function getSupabaseAuthUser(supabase: SupabaseClient) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    return { user, error };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return { user: null, error: error as Error };
  }
}

export async function getAuthToken(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Error getting auth token:', error);
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
} 