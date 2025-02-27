import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    );
    
    const { user, error } = await getSupabaseAuthUser(supabase);
    
    if (error || !user) {
      console.error('Authentication error in debug-ocr endpoint:', error);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: error?.message || 'No user found' 
      }, { status: 401 });
    }
    
    // Log auth info for debugging
    const authInfo = {
      userId: user.id,
      userEmail: user.email,
      isAuthenticated: !!user,
    };
    
    console.log('Debug OCR Auth Info:', authInfo);
    
    // Test direct insert to database
    try {
      const { data: directInsert, error: insertError } = await supabase
        .from('ocr_results')
        .insert({
          original_filename: 'debug-test.jpg',
          processed_text: 'Direct insert test via debug endpoint',
          file_type: 'jpg',
          file_size: 1024,
          user_id: user.id // This is crucial - directly inserting with user_id
        })
        .select();
      
      if (insertError) {
        console.error('Direct insert error:', insertError);
        return NextResponse.json({ 
          error: 'Direct database insert failed',
          authInfo,
          details: insertError 
        }, { status: 500 });
      }
      
      // Test Edge Function call with explicit user_id
      const { data: functionData, error: functionError } = await supabase.functions.invoke('process-ocr', {
        body: {
          fileName: 'debug-test-function.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024,
          fileContent: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD', // Minimal valid base64 image data
          userId: user.id // Pass user ID explicitly
        }
      });
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        return NextResponse.json({
          directInsertSuccess: !!directInsert,
          directInsertData: directInsert,
          edgeFunctionError: functionError,
          authInfo
        }, { status: 200 });
      }
      
      // Return all debug info
      return NextResponse.json({
        message: 'Debug complete',
        authInfo,
        directInsertSuccess: !!directInsert,
        directInsertData: directInsert,
        edgeFunctionSuccess: !!functionData,
        edgeFunctionData: functionData
      }, { status: 200 });
      
    } catch (dbError) {
      console.error('Database error in debug-ocr endpoint:', dbError);
      return NextResponse.json({ 
        error: 'Database operation failed', 
        authInfo,
        details: dbError 
      }, { status: 500 });
    }

  } catch (e) {
    console.error('Unexpected error in debug-ocr endpoint:', e);
    return NextResponse.json({ error: 'Internal Server Error', details: e }, { status: 500 });
  }
} 