import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create Supabase client with auth
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: userError.message 
      }, { status: 500 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        status: 'unauthenticated',
        message: 'No authenticated user found'
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      status: 'authenticated',
      userId: user.id,
      email: user.email,
      message: 'User is authenticated'
    });
    
  } catch (error: any) {
    console.error('Error in test-auth route:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
} 