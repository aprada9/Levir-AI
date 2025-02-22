import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'No document ID provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('ocr_results')
      .select('docx_content, original_filename')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Convert base64 to buffer
    const docxContent = atob(data.docx_content);
    const buffer = new Uint8Array(docxContent.length);
    for (let i = 0; i < docxContent.length; i++) {
      buffer[i] = docxContent.charCodeAt(i);
    }

    // Generate filename
    const filename = `${data.original_filename.split('.')[0]}_ocr.docx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading DOCX:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 