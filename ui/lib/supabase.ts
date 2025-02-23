import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// Test function to verify Supabase configuration
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    console.log('Supabase connection successful:', data)
    return true
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
} 