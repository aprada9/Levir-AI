'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestAuthPage() {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);

    try {
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession();
      const { data: user } = await supabase.auth.getUser();

      setAuthStatus({
        isAuthenticated: !!session,
        session,
        user: user?.user || null
      });

      // Test database query with RLS
      if (session) {
        const { data, error } = await supabase
          .from('ocr_results')
          .select('*')
          .limit(5);

        setTestData({
          data,
          error: error ? error.message : null,
          count: data?.length || 0
        });
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      setAuthStatus({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setApiData(data);
    } catch (error: any) {
      console.error('API test error:', error);
      setApiData({
        error: error.message
      });
    }
  };

  const testServerAPI = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setApiData(data);
    } catch (error: any) {
      console.error('Server API test error:', error);
      setApiData({
        error: error.message
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      {loading ? (
        <div>Loading auth status...</div>
      ) : (
        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Current user session information</p>
            </div>
            <div className="space-y-2">
              <div className="mb-2">
                <strong>Authenticated:</strong> {authStatus?.isAuthenticated ? 'Yes' : 'No'}
              </div>
              {authStatus?.user && (
                <>
                  <div className="mb-2">
                    <strong>User ID:</strong> {authStatus.user.id}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {authStatus.user.email}
                  </div>
                </>
              )}
              {authStatus?.error && (
                <div className="text-red-500">Error: {authStatus.error}</div>
              )}
              <button 
                onClick={checkAuth} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Auth Status
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Database Test</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Test Row Level Security (RLS) access</p>
            </div>
            <div>
              {authStatus?.isAuthenticated ? (
                testData ? (
                  <>
                    <div className="mb-2">
                      <strong>Records found:</strong> {testData.count}
                    </div>
                    {testData.error && (
                      <div className="text-red-500">Error: {testData.error}</div>
                    )}
                    {testData.data && testData.data.length > 0 && (
                      <div className="mt-4">
                        <strong>First record:</strong>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mt-2 overflow-auto max-h-40">
                          {JSON.stringify(testData.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div>No data loaded yet</div>
                )
              ) : (
                <div className="text-amber-500">Please login to test database access</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">API Test</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Test API authentication flows</p>
            </div>
            <div>
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={testAPI}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Test Auth API
                </button>
                <button 
                  onClick={testServerAPI}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Test Server API
                </button>
              </div>
              
              {apiData && (
                <div className="mt-4">
                  <strong>API Response:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mt-2 overflow-auto max-h-80">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 