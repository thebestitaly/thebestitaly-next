import { NextRequest } from 'next/server';

export default async function DirectusTestPage() {
  // Test environment variables
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  
  // Test API call
  let apiTest = null;
  let errorMessage = null;

  try {
    if (directusUrl) {
      const url = `${directusUrl}/items/destinations?limit=1`;
      console.log('🔍 Making request to:', url);
      console.log('🔑 Using token:', directusToken ? `${directusToken.substring(0, 8)}...` : 'NONE');
      
      const response = await fetch(url, {
        headers: directusToken ? {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json',
        } : {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        apiTest = await response.json();
      } else {
        const responseText = await response.text();
        console.log('❌ Response body:', responseText);
        errorMessage = `HTTP ${response.status}: ${response.statusText} - ${responseText}`;
      }
    }
  } catch (error) {
    console.log('💥 Fetch error:', error);
    errorMessage = String(error);
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Directus Connection Test</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>NEXT_PUBLIC_DIRECTUS_URL:</strong> {directusUrl || '❌ NOT SET'}</p>
            <p><strong>DIRECTUS_TOKEN:</strong> {directusToken ? `✅ SET (${directusToken.substring(0, 8)}...)` : '❌ NOT SET'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">API Test</h2>
          {errorMessage ? (
            <div className="text-red-600">
              <p><strong>❌ Error:</strong> {errorMessage}</p>
            </div>
          ) : apiTest ? (
            <div className="text-green-600">
              <p><strong>✅ Success!</strong> Connected to Directus</p>
              <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-yellow-600">⚠️ No URL to test</p>
          )}
        </div>
      </div>
    </div>
  );
} 