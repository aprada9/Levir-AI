import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table } from 'npm:docx'

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

// HTML parsing helper function using regex
function parseHTML(html: string): any[] {
  const elements: any[] = [];
  
  // Split HTML into blocks based on major tags
  const blocks = html.split(/(?=<(?:h[1-6]|p|ul|table|div))/i);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    // Extract tag and content
    const tagMatch = block.match(/<(\w+)[^>]*>([\s\S]*?)(?:<\/\1>|$)/);
    if (!tagMatch) {
      elements.push(new Paragraph({
        children: [new TextRun(block.trim())]
      }));
      continue;
    }
    
    const [_, tag, content] = tagMatch;
    
    switch (tag.toLowerCase()) {
      case 'h1':
        elements.push(new Paragraph({
          text: content.replace(/<[^>]+>/g, '').trim(),
          heading: HeadingLevel.HEADING_1
        }));
        break;
      case 'h2':
        elements.push(new Paragraph({
          text: content.replace(/<[^>]+>/g, '').trim(),
          heading: HeadingLevel.HEADING_2
        }));
        break;
      case 'p':
        // Process inline formatting
        const runs: TextRun[] = [];
        let currentText = content;
        
        // Handle bold text
        currentText = currentText.replace(/<strong>(.*?)<\/strong>/g, (_, text) => {
          runs.push(new TextRun({ text, bold: true }));
          return '';
        });
        
        // Handle italic text
        currentText = currentText.replace(/<em>(.*?)<\/em>/g, (_, text) => {
          runs.push(new TextRun({ text, italics: true }));
          return '';
        });
        
        // Add remaining text
        if (currentText.trim()) {
          runs.push(new TextRun(currentText.replace(/<[^>]+>/g, '').trim()));
        }
        
        elements.push(new Paragraph({ children: runs }));
        break;
      case 'ul':
        const items = content.match(/<li>([\s\S]*?)<\/li>/g) || [];
        items.forEach(item => {
          const itemText = item.replace(/<[^>]+>/g, '').trim();
          elements.push(new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun(itemText)]
          }));
        });
        break;
      case 'table':
        const rows = content.match(/<tr>([\s\S]*?)<\/tr>/g) || [];
        const tableRows = rows.map(row => {
          const cells = row.match(/<td>([\s\S]*?)<\/td>/g) || [];
          return new TableRow({
            children: cells.map(cell => 
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun(cell.replace(/<[^>]+>/g, '').trim())]
                })]
              })
            )
          });
        });
        
        if (tableRows.length > 0) {
          elements.push(new Table({ rows: tableRows }));
        }
        break;
      default:
        elements.push(new Paragraph({
          children: [new TextRun(content.replace(/<[^>]+>/g, '').trim())]
        }));
    }
  }
  
  return elements;
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
            content: `You are a document analysis assistant that extracts and formats text from images with precise HTML formatting.
            Your task is to:
            1. Extract all text from the image and format it with proper HTML
            2. Preserve the EXACT visual layout and structure of the original document
            3. Use semantic HTML tags with specific formatting:
               For tables:
               - Always wrap tables in <table> tags
               - Use <tr> for each row
               - Use <td> for each cell
               - Use <th> for header cells
               - Preserve exact column alignment
               
               For forms and structured data:
               - Use <div class="form-row"> for form-like rows
               - Use <label> for field labels
               - Use <span class="field-value"> for field values
               
               For text formatting:
               - Use <h1>, <h2>, etc. for titles and headings based on visual prominence
               - Use <p> for paragraphs with proper spacing
               - Use <ul>/<li> for lists
               - Use <br> for explicit line breaks
               - Use <strong> for bold/prominent text
               - Use <em> for emphasized text
               - Use <hr> for horizontal lines or separators
               
               For layout:
               - Use <div class="section"> to group related content
               - Preserve indentation and alignment using appropriate CSS classes
               - Use <pre> for maintaining exact spacing in certain text blocks
               
            4. Special Formatting Rules:
               - For tabular data, ALWAYS use proper <table> structure
               - For multi-column layouts, use appropriate table cells
               - For form-like layouts, use consistent structure
               - Preserve ALL whitespace and alignment when significant
               - Use CSS classes to indicate special formatting: centered, right-aligned, etc.
            
            5. Example table structure:
               <table>
                 <tr>
                   <th>NAME</th><th>DATE</th><th>CITY</th>
                 </tr>
                 <tr>
                   <td>John</td><td>9-21-89</td><td>BARABOO</td>
                 </tr>
               </table>

            6. Return ONLY the formatted HTML without any explanations or markdown.
            7. Ensure EXACT visual fidelity to the original document layout.`
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
    
    // Store the raw version in the database with HTML intact
    const processedText = extractedText.trim();

    // Create Word document with HTML conversion (preserve formatting)
    const docElements = parseHTML(processedText); // Use our HTML parser for DOCX

    const doc = new Document({
      sections: [{
        properties: {},
        children: docElements
      }]
    });

    // Generate docx buffer
    const docxBuffer = await Packer.toBuffer(doc);
    const docxBase64 = btoa(String.fromCharCode(...new Uint8Array(docxBuffer)));

    // Store result in database with HTML formatting preserved
    console.log('Storing result in database...');
    const { data: dbData, error: dbError } = await supabase
      .from('ocr_results')
      .insert({
        original_filename: fileName,
        processed_text: processedText, // Store the HTML version
        file_type: fileType,
        file_size: fileSize,
        docx_content: docxBase64
      })
      .select()
      .single();

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

    // Return both HTML and DOCX versions
    return new Response(
      JSON.stringify({ 
        text: processedText, // Return the HTML version for display
        html: processedText, // Explicit HTML version
        docxBase64: docxBase64,
        id: dbData.id
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