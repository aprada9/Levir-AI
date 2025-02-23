'use client';

import { useRef, useState } from 'react';
import { File, LoaderCircle, Upload, FileText, FileIcon, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, convertInchesToTwip, WidthType, AlignmentType } from 'docx';
import styles from './ocr.module.css';

interface OCRResult {
  text: string;
  id: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Add HTML parsing function
function parseHTMLForDOCX(html: string): any[] {
  const elements: any[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  function processNode(node: Element): any[] {
    const results: any[] = [];
    
    if (node.tagName) {
      switch (node.tagName.toLowerCase()) {
        case 'h1':
          results.push(new Paragraph({
            children: [new TextRun({ text: node.textContent || '', bold: true, size: 32 })],
            spacing: { before: 240, after: 120 }
          }));
          break;
          
        case 'h2':
          results.push(new Paragraph({
            children: [new TextRun({ text: node.textContent || '', bold: true, size: 26 })],
            spacing: { before: 240, after: 120 }
          }));
          break;
          
        case 'p':
          results.push(new Paragraph({
            children: [new TextRun({ text: node.textContent || '' })],
            spacing: { before: 120, after: 120 }
          }));
          break;
          
        case 'table': {
          const rows = Array.from(node.getElementsByTagName('tr')).map(tr => {
            const cells = Array.from(tr.children).map(td => {
              return new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: td.textContent || '' })]
                })]
              });
            });
            return new TableRow({ children: cells });
          });
          
          if (rows.length > 0) {
            results.push(new Table({
              rows: rows
            }));
          }
          break;
        }
        
        case 'hr':
          results.push(new Paragraph({
            children: [new TextRun({ text: '_______________', bold: true })],
            spacing: { before: 240, after: 240 },
            alignment: AlignmentType.CENTER
          }));
          break;
          
        case 'div':
          // Process children
          Array.from(node.children).forEach(child => {
            if (child instanceof Element) {
              results.push(...processNode(child));
            }
          });
          break;
          
        default:
          if (node.textContent?.trim()) {
            results.push(new Paragraph({
              children: [new TextRun({ text: node.textContent.trim() })]
            }));
          }
      }
    }
    
    return results;
  }

  Array.from(tempDiv.children).forEach(node => {
    if (node instanceof Element) {
      elements.push(...processNode(node));
    }
  });

  return elements;
}

const OCRPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextDownload = () => {
    if (!result) return;
    
    // Strip HTML tags and markdown code block markers
    const plainText = result.text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/^```html\s*/, '') // Remove opening markdown code block
      .replace(/```\s*$/, '') // Remove closing markdown code block
      .trim();
      
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDocxDownload = async () => {
    if (!result) return;

    try {
      const docElements = parseHTMLForDOCX(result.text);
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: docElements
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted-text.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Error generating document. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    
    // Strip HTML tags and markdown code block markers
    const plainText = result.text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/^```html\s*/, '') // Remove opening markdown code block
      .replace(/```\s*$/, '') // Remove closing markdown code block
      .trim();
      
    try {
      await navigator.clipboard.writeText(plainText);
      toast.success('Text copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy text to clipboard');
    }
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(
        `/api/ocr`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to process image');
      }

      const data = await res.json();
      setResult(data);
      toast.success('Text extracted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8">
      <h1 className="text-4xl font-bold text-black/70 dark:text-white/70">OCR</h1>
      <p className="text-xl text-black/50 dark:text-white/50 mt-4 mb-8">
        Extract text from images using AI
      </p>

      <div className="w-full max-w-2xl">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8",
            "border-black/10 dark:border-white/10",
            "hover:border-black/20 dark:hover:border-white/20",
            "transition-colors duration-200",
            "flex flex-col items-center justify-center gap-4",
            "cursor-pointer"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            disabled={loading}
          />
          
          {loading ? (
            <LoaderCircle className="w-8 h-8 animate-spin text-black/50 dark:text-white/50" />
          ) : preview ? (
            <img src={preview} alt="Preview" className="max-h-48 object-contain" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-black/50 dark:text-white/50" />
              <p className="text-center text-black/50 dark:text-white/50">
                Click to upload or drag and drop<br />
                PNG, JPG, GIF or WebP (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg max-w-2xl w-full">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 w-full max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-black/50 dark:text-white/50" />
                <h2 className="text-lg font-semibold text-black/70 dark:text-white/70">
                  Extracted Text
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-black/50 dark:text-white/50" />
                  <span className="text-black/70 dark:text-white/70">Copy</span>
                </button>
                <button
                  onClick={handleTextDownload}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download as TXT"
                >
                  <FileText className="w-4 h-4 text-black/50 dark:text-white/50" />
                  <span className="text-black/70 dark:text-white/70">TXT</span>
                </button>
                <button
                  onClick={handleDocxDownload}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download as DOCX"
                >
                  <FileIcon className="w-4 h-4 text-black/50 dark:text-white/50" />
                  <span className="text-black/70 dark:text-white/70">DOCX</span>
                </button>
              </div>
            </div>
            <div 
              className={`ocr-content ${styles.ocrContent}`}
              dangerouslySetInnerHTML={{ 
                __html: result.text
                  .replace(/^```html\s*/, '') // Remove opening markdown code block
                  .replace(/```\s*$/, '') // Remove closing markdown code block
                  .trim() 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRPage; 