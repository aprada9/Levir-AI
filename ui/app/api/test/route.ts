import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create Supabase client with auth
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // Test Supabase connection and tables
    const { data: tableData, error: tableError } = await supabase
      .from('ocr_results')
      .select('id, user_id, original_filename')
      .limit(5);
    
    // Check database configuration
    const { data: rpcData, error: rpcError } = await supabase.rpc('test_has_rls');
    
    // Collect all environment info 
    const envInfo = {
      // Don't include sensitive variables, only whether they're defined
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    return NextResponse.json({
      environment: envInfo,
      auth: {
        session: sessionData,
        sessionError: sessionError ? sessionError.message : null,
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id || null,
      },
      database: {
        tableData,
        tableError: tableError ? tableError.message : null,
        recordCount: tableData?.length || 0,
        rpcData,
        rpcError: rpcError ? rpcError.message : null,
      }
    });
    
  } catch (error: any) {
    console.error('Error in test route:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 