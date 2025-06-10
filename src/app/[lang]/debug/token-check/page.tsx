export default async function TokenCheckPage() {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;
  const publicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Token Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Exact Token Values</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>NEXT_PUBLIC_DIRECTUS_URL:</strong></p>
            <div className="bg-gray-100 p-2 rounded">{directusUrl || 'UNDEFINED'}</div>
            
            <p><strong>DIRECTUS_TOKEN:</strong></p>
            <div className="bg-gray-100 p-2 rounded">{directusToken || 'UNDEFINED'}</div>
            
            <p><strong>NEXT_PUBLIC_DIRECTUS_TOKEN:</strong></p>
            <div className="bg-gray-100 p-2 rounded">{publicToken || 'UNDEFINED'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 