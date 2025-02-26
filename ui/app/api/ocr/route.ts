import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Create Supabase client with auth
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Invoking OCR function with file:', {
      name: (file as File).name,
      type: (file as File).type,
      size: (file as File).size,
      userId: user.id
    });

    // Convert file to base64
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Make sure userId is sent as a proper string
    const userId = user.id ? String(user.id) : null;
    console.log('About to invoke Supabase function with userId:', userId);

    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'process-ocr',
      {
        body: {
          fileName: (file as File).name,
          fileType: (file as File).type,
          fileSize: (file as File).size,
          fileContent: base64,
          userId: userId
        }
      }
    );

    if (functionError) {
      console.error('Supabase function error:', functionError);
      return NextResponse.json(
        { error: `Function error: ${functionError.message}`, details: functionError },
        { status: 500 }
      );
    }

    if (!functionData) {
      return NextResponse.json(
        { error: 'No data returned from OCR function' },
        { status: 500 }
      );
    }

    return NextResponse.json(functionData);
  } catch (error: any) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { 
        error: `OCR processing failed: ${error.message}`,
        details: error.stack || error
      },
      { status: 500 }
    );
  }
} 