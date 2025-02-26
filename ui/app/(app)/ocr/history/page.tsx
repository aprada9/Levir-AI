'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FileText, FileIcon, Copy, Eye, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface OCRResult {
  id: string;
  original_filename: string;
  processed_text: string;
  file_type: string;
  file_size: number;
  docx_content: string;
  created_at: string;
  user_id: string;
}

const OCRHistoryPage = () => {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<OCRResult | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('Fetching OCR history...');
        setError(null);
        
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('You must be logged in to view your OCR history');
          setLoading(false);
          return;
        }
        
        console.log('Authenticated as user:', session.user.id);
        
        const { data, error } = await supabase
          .from('ocr_results')
          .select('*')
          .eq('user_id', session.user.id) // Explicitly filter by user_id for added safety
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching OCR history:', error);
          setError(error.message);
          toast.error(`Failed to load OCR history: ${error.message}`);
          return;
        }

        if (!data) {
          console.log('No OCR results found');
          setResults([]);
          return;
        }

        console.log(`Successfully fetched ${data.length} OCR results`);
        setResults(data);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Unexpected error in fetchHistory:', error);
        setError(errorMessage);
        toast.error(`Failed to load OCR history: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [supabase]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      const plainText = text
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/^```html\s*/, '') // Remove opening markdown code block
        .replace(/```\s*$/, '') // Remove closing markdown code block
        .trim();
      
      await navigator.clipboard.writeText(plainText);
      toast.success('Text copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy text to clipboard');
    }
  };

  const handleTextDownload = (result: OCRResult) => {
    const plainText = result.processed_text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/^```html\s*/, '') // Remove opening markdown code block
      .replace(/```\s*$/, '') // Remove closing markdown code block
      .trim();
      
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.original_filename.split('.')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDocxDownload = async (result: OCRResult) => {
    try {
      // If we have docx_content, use it directly
      if (result.docx_content) {
        const binaryString = atob(result.docx_content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.original_filename.split('.')[0]}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to creating a new DOCX from the text
        const plainText = result.processed_text
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/^```html\s*/, '')
          .replace(/```\s*$/, '')
          .trim();

        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun(plainText)]
              })
            ]
          }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.original_filename.split('.')[0]}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Error generating document. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this OCR result?')) {
      return;
    }

    try {
      console.log(`Attempting to delete OCR result with ID: ${id}`);
      
      const { error } = await supabase
        .from('ocr_results')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting OCR result:', error);
        toast.error(`Failed to delete OCR result: ${error.message}`);
        return;
      }

      console.log('Successfully deleted OCR result');
      setResults(results.filter(result => result.id !== id));
      toast.success('OCR result deleted successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Unexpected error in handleDelete:', error);
      toast.error(`Failed to delete OCR result: ${errorMessage}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8">
      <h1 className="text-4xl font-bold text-black/70 dark:text-white/70">OCR History</h1>
      <p className="text-xl text-black/50 dark:text-white/50 mt-4 mb-8">
        View your past OCR scans
      </p>

      {error && (
        <div className="w-full max-w-6xl mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black/70 dark:border-white/70" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-black/50 dark:text-white/50">
          No OCR results found
        </div>
      ) : (
        <div className="w-full max-w-6xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70 dark:text-white/70">{result.original_filename}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70 dark:text-white/70">{result.file_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70 dark:text-white/70">{formatFileSize(result.file_size)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70 dark:text-white/70">
                        {format(new Date(result.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-black/50 dark:text-white/50" />
                          </button>
                          <button
                            onClick={() => handleCopyToClipboard(result.processed_text)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            title="Copy text"
                          >
                            <Copy className="w-4 h-4 text-black/50 dark:text-white/50" />
                          </button>
                          <button
                            onClick={() => handleTextDownload(result)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            title="Download as TXT"
                          >
                            <FileText className="w-4 h-4 text-black/50 dark:text-white/50" />
                          </button>
                          <button
                            onClick={() => handleDocxDownload(result)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            title="Download as DOCX"
                          >
                            <FileIcon className="w-4 h-4 text-black/50 dark:text-white/50" />
                          </button>
                          <button
                            onClick={() => handleDelete(result.id)}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedResult && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-black/50 dark:text-white/50" />
                  <h2 className="text-lg font-semibold text-black/70 dark:text-white/70">
                    {selectedResult.original_filename}
                  </h2>
                </div>
              </div>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: selectedResult.processed_text
                    .replace(/^```html\s*/, '')
                    .replace(/```\s*$/, '')
                    .trim() 
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRHistoryPage; 