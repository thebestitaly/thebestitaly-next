import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  Pagination,
} from 'react-instantsearch-hooks-web';

const searchClient = algoliasearch(
  '7ZFEAUVN5K',
  '55356298f0725a7c4e42241d08ff2d32'
);

const SearchComponent = () => {
  return (
    <InstantSearch 
      indexName="thebestitaly"
      searchClient={searchClient}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Ricerca Destinazioni</h1>
        <SearchBox placeholder="Cerca destinazioni..." className="mb-4" />
        <Hits 
          hitComponent={({ hit }) => (
            <div className="border p-4 rounded-lg mb-4">
              <h2 className="text-xl font-semibold">{hit.destination_name}</h2>
              <p className="mt-2">{hit.description}</p>
              {hit.region_name && (
                <p className="mt-2"><strong>Regione:</strong> {hit.region_name}</p>
              )}
              {hit.province_name && (
                <p><strong>Provincia:</strong> {hit.province_name}</p>
              )}
            </div>
          )}
        />
        <Pagination className="mt-4" />
      </div>
    </InstantSearch>
  );
};

export default SearchComponent;