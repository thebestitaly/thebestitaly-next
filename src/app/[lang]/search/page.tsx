"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Pagination,
} from "react-instantsearch-hooks-web";

// Configurazione client Algolia
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

// Componente per singolo "hit" (risultato) di ricerca
const Hit = ({ hit }: { hit: any }) => {
  const imageUrl = hit.image_id
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${hit.image_id}`
    : "/placeholder-image.jpg";

  // Funzione per costruire l'URL in modo sicuro
  const constructUrl = () => {
    // Se manca la lingua, restituiamo null per non renderizzare il Link
    if (!hit.language_code) return null;

    // Aggiungiamo i segmenti in modo dinamico
    const segments = [
      hit.language_code, 
      hit.region_slug, 
      hit.province_slug, 
      hit.slug_permalink
    ].filter(Boolean); // rimuove valori falsy (undefined, "", null)

    // Se dopo il filtro non c'è abbastanza contenuto, non renderizziamo
    if (segments.length < 2) {
      return null; 
    }

    return "/" + segments.join("/");
  };

  const url = constructUrl();
  
  // Se non abbiamo un URL valido, non renderizziamo il link
  if (!url) {
    return (
      <div className="block bg-white rounded-lg shadow-sm transition-shadow duration-200 overflow-hidden opacity-50">
        <div className="aspect-[4/3] relative w-full max-w-[200px]">
          <img
            src={imageUrl}
            alt={hit.destination_name || "Destinazione"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
        </div>
        <div className="p-2">
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {hit.destination_name}
          </h2>
          {hit.region_name && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {hit.region_name}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href={url}>
      <div className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="aspect-[4/3] relative w-full max-w-[200px]">
          <img
            src={imageUrl}
            alt={hit.destination_name || "Destinazione"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
          />
        </div>
        <div className="p-2">
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {hit.destination_name}
          </h2>
          {hit.region_name && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {hit.region_name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Pagina principale di ricerca
const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container mx-auto px-4 py-8">
      <InstantSearch
        searchClient={searchClient}
        indexName="thebestitaly"
        initialUiState={{
          thebestitaly: {
            query,
          },
        }}
      >
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBox
            placeholder="Cerca destinazioni..."
            classNames={{
              root: "w-full",
              form: "relative",
              input:
                "w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500",
              submit: "absolute right-3 top-1/2 -translate-y-1/2",
              submitIcon: "w-5 h-5 fill-current text-gray-500",
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <Hits hitComponent={Hit} />
        </div>

        <div className="mt-8 flex justify-center">
          <Pagination
            classNames={{
              list: "flex gap-2",
              item: "px-3 py-2 border rounded hover:bg-gray-100",
              selectedItem: "bg-blue-500 text-white hover:bg-blue-600",
            }}
          />
        </div>
      </InstantSearch>
    </div>
  );
};

export default SearchResultsPage;
