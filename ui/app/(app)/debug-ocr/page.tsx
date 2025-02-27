'use client';

import { useState } from 'react';

export default function DebugOCRPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
      
      if (!response.ok) {
        setError(`Error: ${response.status} - ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">OCR Debug Tool</h1>
      <div className="mb-4">
        <p className="mb-2">This page tests the OCR processing and user ID handling.</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={testConnection}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test OCR Connection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Test Results:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 