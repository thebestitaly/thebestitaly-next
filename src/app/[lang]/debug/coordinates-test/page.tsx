import directusClient from '@/lib/directus';

export default async function CoordinatesTestPage() {
  try {
    const destinations = await directusClient.getDestinationsByType('region', 'it');
    
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">🗺️ Test Coordinate Destinazioni</h1>
        
        <div className="space-y-4">
          {destinations.map((destination) => {
            const translation = destination.translations[0];
            
            return (
              <div key={destination.id} className="bg-white p-4 rounded-lg shadow border">
                <h2 className="text-xl font-bold mb-2">
                  {translation?.destination_name || 'Nome non disponibile'}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>ID:</strong> {destination.id}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {destination.type}
                  </div>
                  <div>
                    <strong>Latitude:</strong> {destination.lat || 'Non disponibile'}
                  </div>
                  <div>
                    <strong>Longitude:</strong> {destination.long || 'Non disponibile'}
                  </div>
                  <div className="col-span-2">
                    <strong>Slug:</strong> {translation?.slug_permalink || 'Non disponibile'}
                  </div>
                </div>
                
                {destination.lat && destination.long && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    ✅ <strong>Coordinate disponibili!</strong> La mappa verrà mostrata.
                  </div>
                )}
                
                {(!destination.lat || !destination.long) && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded">
                    ⚠️ <strong>Coordinate mancanti.</strong> Aggiungi lat/long in Directus per vedere la mappa.
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">📝 Istruzioni:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Vai nel tuo pannello Directus</li>
            <li>Apri la collezione "destinations"</li>
            <li>Aggiungi due campi numerici: "lat" e "long"</li>
            <li>Inserisci le coordinate per le destinazioni che vuoi mostrare sulla mappa</li>
            <li>Ricarica questa pagina per verificare</li>
          </ol>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-red-600">❌ Errore</h1>
        <div className="bg-red-50 p-4 rounded-lg">
          <p><strong>Errore:</strong> {String(error)}</p>
        </div>
      </div>
    );
  }
} 