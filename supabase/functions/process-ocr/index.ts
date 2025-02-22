import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Document, Packer, Paragraph, TextRun } from 'npm:docx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

// Function to generate a UUID
function generateUUID() {
  return crypto.randomUUID();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Log request details
    console.log('Processing request:', req.method);
    
    const { fileName, fileType, fileSize, fileContent } = await req.json()
    console.log('Received file details:', { fileName, fileType, fileSize });

    if (!fileContent) {
      throw new Error('No file content provided')
    }

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(fileType)) {
      throw new Error('Unsupported file format. Please upload a PNG, JPEG, GIF, or WebP image.')
    }

    // Log environment variables (without revealing sensitive values)
    console.log('Environment check:', {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasSupabaseKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasOpenAIKey: !!Deno.env.get('OPENAI_API_KEY'),
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert base64 to Blob
    const binaryString = atob(fileContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: fileType });

    // Generate storage filename
    const fileExtension = fileName.split('.').pop() || '';
    const storageId = generateUUID();
    const storageFileName = `${storageId}${fileExtension ? `.${fileExtension}` : ''}`;
    
    console.log('Storage details:', {
      originalName: fileName,
      generatedName: storageFileName,
      storageId: storageId
    });

    console.log('Preparing to upload file with generated name:', storageFileName);
    // Upload file to temporary storage
    console.log('Uploading to storage with name:', storageFileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ocr-temp')
      .upload(storageFileName, blob, {
        cacheControl: '3600',
        upsert: false // Prevent overwriting
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    // Get public URL for GPT-4V
    console.log('Getting public URL for file:', storageFileName);
    const { data: { publicUrl } } = supabase.storage
      .from('ocr-temp')
      .getPublicUrl(storageFileName);

    // Process with OpenAI
    console.log('Processing with OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a document analysis assistant that extracts text from images.\n\
            Extract all text from the image while preserving its structure and layout.\n\
            Important rules:\n\
            1. DO NOT include any HTML tags, markdown, or formatting\n\
            2. Use plain text formatting:\n\
               - Use blank lines to separate sections\n\
               - Use tabs (\\t) to separate columns in tables\n\
               - Use standard bullet points (•) for lists\n\
               - Use line breaks to maintain layout\n\
            3. Preserve the visual hierarchy using spacing\n\
            4. Return ONLY the extracted text without any additional formatting or explanation"
          },
          {
            role: "user",
            content: [
              {
                "type": "image_url",
                "image_url": {
                  "url": publicUrl
                }
              },
              "Please extract and format the text from this document, preserving its structure and layout."
            ]
          }
        ],
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI error:', error);
      throw new Error(`Failed to process image: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    let extractedText = data.choices[0]?.message?.content || 'Unable to extract text'
    
    // Store the raw version in the database
    const processedText = extractedText.trim();

    // Clean and format the text for display
    const cleanText = processedText
      .replace(/\t+/g, '\t') // Normalize multiple tabs to single tab
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
      .replace(/^\s+|\s+$/gm, '') // Trim each line
      .trim();

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: cleanText.split('\n').map(line => 
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                break: line === '' ? 1 : 0
              })
            ]
          })
        )
      }]
    });

    // Generate docx buffer
    const docxBuffer = await Packer.toBuffer(doc);
    const docxBase64 = btoa(String.fromCharCode(...new Uint8Array(docxBuffer)));

    // Store result in database
    console.log('Storing result in database...');
    const { error: dbError } = await supabase
      .from('ocr_results')
      .insert({
        original_filename: fileName,
        processed_text: processedText,
        file_type: fileType,
        file_size: fileSize,
        docx_content: docxBase64 // Store the docx content for later retrieval
      })

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Delete temporary file
    console.log('Cleaning up temporary file...');
    const { error: deleteError } = await supabase.storage
      .from('ocr-temp')
      .remove([storageFileName])

    if (deleteError) {
      console.error('Error deleting temporary file:', deleteError)
    }

    return new Response(
      JSON.stringify({ 
        text: cleanText,
        docxBase64: docxBase64 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      },
    )

  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      },
    )
  }
})