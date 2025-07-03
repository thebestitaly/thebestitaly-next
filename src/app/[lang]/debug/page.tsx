'use client';

import { useEffect, useState } from 'react';
import directusAdminClient from '../../../lib/directus-admin';

export default function DebugPage() {
  const [status, setStatus] = useState('Testing...');
  const [envVars, setEnvVars] = useState({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: process.env.NEXT_PUBLIC_DIRECTUS_URL,
      token: process.env.NEXT_PUBLIC_DIRECTUS_TOKEN ? 'Present' : 'Missing'
    });

    // Test the connection
    const runTests = async () => {
      const results = [];

      // Test 1: Authentication
      try {
        const isAuth = await directusAdminClient.testAuth();
        results.push({
          test: 'Authentication',
          status: isAuth ? '✅ Success' : '❌ Failed',
          details: isAuth ? 'Connected to Directus' : 'Authentication failed'
        });
      } catch (error: any) {
        results.push({
          test: 'Authentication',
          status: '❌ Error',
          details: error.message
        });
      }

      // Test 2: Get translations
      try {
        const translations = await directusAdminClient.get('/items/translations', {
          params: { limit: 1 }
        });
        results.push({
          test: 'Translations API',
          status: '✅ Success',
          details: `Found ${translations.data?.data?.length || 0} items`
        });
      } catch (error: any) {
        results.push({
          test: 'Translations API',
          status: '❌ Error',
          details: error.message
        });
      }

      // Test 3: Get destinations
      try {
        const destinations = await directusAdminClient.getDestinationsByType('region', 'it');
        results.push({
          test: 'Destinations API',
          status: '✅ Success',
          details: `Found ${destinations.length} regions`
        });
      } catch (error: any) {
        results.push({
          test: 'Destinations API',
          status: '❌ Error',
          details: error.message
        });
      }

      setTestResults(results);
      
      const allPassed = results.every(r => r.status.includes('✅'));
      setStatus(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
    };

    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h1>🔧 Directus Connection Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>📊 Overall Status:</h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{status}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h2>🔧 Environment Variables:</h2>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px' }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fff0', borderRadius: '5px' }}>
        <h2>🧪 Test Results:</h2>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '3px',
            border: result.status.includes('✅') ? '2px solid green' : '2px solid red'
          }}>
            <strong>{result.test}:</strong> {result.status}
            <br />
            <small>{result.details}</small>
          </div>
        ))}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff5f5', borderRadius: '5px' }}>
        <h2>📋 Expected Configuration:</h2>
        <p><strong>URL:</strong> https://directus-production-93f0.up.railway.app</p>
        <p><strong>Token:</strong> Should be present</p>
      </div>
    </div>
  );
} 