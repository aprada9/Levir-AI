import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Invoking OCR function with file:', {
      name: (file as File).name,
      type: (file as File).type,
      size: (file as File).size
    });

    // Convert file to base64
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'process-ocr',
      {
        body: {
          fileName: (file as File).name,
          fileType: (file as File).type,
          fileSize: (file as File).size,
          fileContent: base64
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