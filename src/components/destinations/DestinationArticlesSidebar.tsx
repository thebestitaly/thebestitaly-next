"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import directusWebClient from '../../lib/directus-web';
import ArticleCardSidebar from '../magazine/ArticleCardSidebar';
import { useTranslation } from '@/hooks/useTranslations';

interface DestinationArticlesSidebarProps {
  lang: string;
  destinationId: string;
}

const DestinationArticlesSidebar: React.FC<DestinationArticlesSidebarProps> = ({ lang, destinationId }) => {
  const [isClient, setIsClient] = React.useState(false);
  const { translation: featuredArticlesText } = useTranslation('featured_articles', lang, 'general');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // 🚀 Query OTTIMIZZATA per articoli della stessa destinazione - Single query, no meta count
  const { data: destinationArticles } = useQuery({
    queryKey: ['destination-articles-sidebar', destinationId, lang],
    queryFn: () => directusWebClient.getArticles({
      lang,
      fields: 'sidebar',
      limit: 8,
      destination_id: destinationId,
      filters: { category_id: { _neq: 9 } } // Escludi categoria 9
    }),
    enabled: isClient && !!destinationId,
    staleTime: 1000 * 60 * 60 * 6, // 6 ORE - cache aggressiva
    gcTime: 1000 * 60 * 60 * 12, // 12 ORE - mantieni in memoria più a lungo
  });

  // 🚀 Query ULTRA-OTTIMIZZATA per altri articoli - Cache lunga, contenuti generici
  const { data: otherArticles, isLoading, error } = useQuery({
    queryKey: ['latest-articles-sidebar', lang],
    queryFn: () => directusWebClient.getArticles({
      lang,
      fields: 'sidebar',
      limit: 15
    }),
    enabled: isClient,
    staleTime: 1000 * 60 * 60 * 12, // 12 ORE - cache molto aggressiva per contenuti generici
    gcTime: 1000 * 60 * 60 * 24, // 24 ORE - mantieni in memoria molto più a lungo
  });

  if (!isClient || isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          No articles available at the moment. Please check again later.
        </p>
      </div>
    );
  }

  // Combina gli articoli: prima quelli della destinazione, poi gli altri (filtrati per evitare duplicati)
  const destinationArticlesList = Array.isArray(destinationArticles) ? destinationArticles : [];
  const otherArticlesList = Array.isArray(otherArticles) ? otherArticles : [];
  
  const filteredOtherArticles = otherArticlesList.filter((article: any) => 
    !destinationArticlesList.some((destArticle: any) => destArticle.id === article.id)
  );
  
  // Prendi fino a 20 articoli totali, dando priorità a quelli della destinazione
  const combinedArticles = [
    ...destinationArticlesList,
    ...filteredOtherArticles
  ].slice(0, 20);

  if (combinedArticles.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          No articles available at the moment. Please check again later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800">{featuredArticlesText}</h3>
      
      {/* Mostra prima gli articoli della stessa destinazione */}
      {destinationArticlesList.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
            📍 Articoli su questa destinazione
          </h4>
          <ul className="space-y-3">
            {destinationArticlesList.map((article: any) => (
              <ArticleCardSidebar key={article.id} article={article} lang={lang} />
            ))}
          </ul>
        </div>
      )}
      
      {/* Poi mostra altri articoli se necessario */}
      {filteredOtherArticles.length > 0 && (
        <div>
          <ul className="space-y-3">
            {filteredOtherArticles.slice(0, 20 - destinationArticlesList.length).map((article: any) => (
              <ArticleCardSidebar key={article.id} article={article} lang={lang} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DestinationArticlesSidebar; 