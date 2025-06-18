"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import directusClient from '../../lib/directus';
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

  // Query per articoli della stessa destinazione
  const { data: destinationArticles } = useQuery({
    queryKey: ['destination-articles', destinationId, lang],
    queryFn: () => directusClient.getArticles(
      lang, 
      0, // offset
      10, // limit
      {
        destination_id: { _eq: destinationId },
        category_id: { _neq: 9 } // Escludi categoria 9
      }
    ),
    enabled: isClient && !!destinationId,
  });

  // Query per altri articoli (se non abbiamo abbastanza articoli della destinazione)
  const { data: otherArticles, isLoading, error } = useQuery({
    queryKey: ['other-articles', lang, 'destination-sidebar'],
    queryFn: () => directusClient.getArticles(
      lang, 
      0, // offset
      20, // limit
      {
        destination_id: { _neq: destinationId }, // Escludi articoli della stessa destinazione
        category_id: { _neq: 9 } // Escludi categoria 9
      }
    ),
    enabled: isClient,
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

  // Combina gli articoli: prima quelli della destinazione, poi gli altri
  const destinationArticlesList = destinationArticles?.articles || [];
  const otherArticlesList = otherArticles?.articles || [];
  
  // Prendi fino a 20 articoli totali, dando priorità a quelli della destinazione
  const combinedArticles = [
    ...destinationArticlesList,
    ...otherArticlesList
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
            {destinationArticlesList.map((article) => (
              <ArticleCardSidebar key={article.id} article={article} lang={lang} />
            ))}
          </ul>
        </div>
      )}
      
      {/* Poi mostra altri articoli se necessario */}
      {otherArticlesList.length > 0 && (
        <div>
          <ul className="space-y-3">
            {otherArticlesList.slice(0, 20 - destinationArticlesList.length).map((article) => (
              <ArticleCardSidebar key={article.id} article={article} lang={lang} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DestinationArticlesSidebar; 