'use client';

import { useRef, useState } from 'react';
import { File, LoaderCircle, Upload, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OCRResult {
  text: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const OCRPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result.text], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="mt-8 w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-black/50 dark:text-white/50" />
                <h2 className="text-lg font-semibold text-black/70 dark:text-white/70">
                  Extracted Text
                </h2>
              </div>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Download className="w-5 h-5 text-black/50 dark:text-white/50" />
              </button>
            </div>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: result.text }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRPage; 