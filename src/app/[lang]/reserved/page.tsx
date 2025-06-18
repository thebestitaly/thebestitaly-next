"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import directusClient from "../../../lib/directus";

// Interfaccia per la risposta degli articoli da Directus
interface ArticleDirectusResponse {
  id: string | number;
  status: string;
  date_created: string;
  date_updated: string | null;
  image?: string;
  translations?: {
    titolo_articolo?: string;
    slug_permalink?: string;
    seo_summary?: string;
    [key: string]: unknown;
  }[];
}

// Interfaccia per l'articolo visualizzato
interface ArticleSummary {
  id: string | number;
  status: string;
  date_created: string;
  date_updated: string | null;
  image?: string;
  titolo_articolo?: string;
  slug_permalink?: string;
  seo_summary?: string;
}

// Interfaccia per la risposta delle destinazioni da Directus
interface DestinationDirectusResponse {
  id: string | number;
  type: string;
  image?: string;
  translations?: {
    destination_name?: string;
    slug_permalink?: string;
    seo_summary?: string;
    [key: string]: unknown;
  }[];
}

// Interfaccia per la destinazione visualizzata
interface DestinationSummary {
  id: string | number;
  type: string;
  image?: string;
  destination_name?: string;
  slug_permalink?: string;
  seo_summary?: string;
}

// Interfaccia per la risposta delle companies da Directus
interface CompanyDirectusResponse {
  id: string | number;
  company_name: string;
  website?: string;
  active: boolean;
  image?: string;
  translations?: {
    description?: string;
    slug_permalink?: string;
    seo_summary?: string;
    [key: string]: unknown;
  }[];
}

// Interfaccia per la company visualizzata
interface CompanySummary {
  id: string | number;
  company_name: string;
  website?: string;
  active: boolean;
  image?: string;
  description?: string;
  slug_permalink?: string;
  seo_summary?: string;
}

const LANG_IT = "it";

function ArticlesList() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'destinations' | 'companies'>('articles');
  const [translatingItems, setTranslatingItems] = useState<Set<string | number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [companiesPage, setCompaniesPage] = useState(0);
  const COMPANIES_PER_PAGE = 10;

  // Funzione per recuperare gli articoli
  const fetchArticles = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Iniziando fetch articoli...");

      // Per la sezione riservata, recuperiamo tutti gli articoli (draft + published)
      const { articles } = await directusClient.getArticlesForReserved(LANG_IT, 0, 50);

      // Mappa gli articoli recuperati al formato ArticleSummary
      const mappedArticles: ArticleSummary[] = articles.map((article: any) => {
        const articleTranslation = article.translations?.[0];
        return {
          id: article.id,
          status: article.status || "draft", // Usa lo status reale dall'articolo
          date_created: article.date_created,
          date_updated: article.date_updated || null,
          image: article.image,
          titolo_articolo: articleTranslation?.titolo_articolo ?? "[Titolo non disponibile]",
          slug_permalink: articleTranslation?.slug_permalink,
          seo_summary: articleTranslation?.seo_summary
        };
      });

      setArticles(mappedArticles);

    } catch (err) {
      console.error("Errore nel caricamento articoli:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per recuperare le destinazioni
  const fetchDestinations = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Iniziando fetch destinazioni...");

      const destinationsResponse = await directusClient.getDestinationsByType("region", LANG_IT);

     
      const mappedDestinations: DestinationSummary[] = destinationsResponse.map((destination: any) => {
        const destinationTranslation = destination.translations?.[0];
        return {
          id: destination.id,
          type: destination.type,
          image: destination.image,
          destination_name: destinationTranslation?.destination_name ?? "[Nome non disponibile]",
          slug_permalink: destinationTranslation?.slug_permalink,
          seo_summary: destinationTranslation?.seo_summary
        };
      });

      console.log("Destinazioni mappate:", mappedDestinations);
      setDestinations(mappedDestinations);

    } catch (err) {
      console.error("Errore nel caricamento destinazioni:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per recuperare le companies
  const fetchCompanies = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Iniziando fetch companies...");

      // Usiamo getCompaniesForListing per l'area admin (senza filtri)
      const companiesResponse = await directusClient.getCompaniesForListing(LANG_IT, {});

      
      const mappedCompanies: CompanySummary[] = companiesResponse.map((company: any) => {
        const companyTranslation = company.translations?.[0];
        return {
          id: company.id,
          company_name: company.company_name,
          website: company.website,
          active: company.active, // Questo ora dovrebbe funzionare
          image: company.featured_image, // Usiamo featured_image
          description: companyTranslation?.description,
          slug_permalink: companyTranslation?.slug_permalink,
          seo_summary: companyTranslation?.seo_summary
        };
      });

      // Ordina per ID decrescente (ultimo creato per primo)
      const sortedCompanies = mappedCompanies.sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
        const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
        return idB - idA;
      });

      setCompanies(sortedCompanies);
      setFilteredCompanies(sortedCompanies);

    } catch (err) {
      console.error("Errore nel caricamento companies:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  };

  // funzione che invoca il trigger traduzione (mantenuta dal tuo codice originale)
  async function triggerTranslate(articleId: number | string) {
    setTranslatingItems(prev => new Set(prev).add(articleId));
    try {
      const res = await fetch(`/it/api/translate-articles/${articleId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Errore traduzione: ${res.status}`);
      const payload = await res.json();
      console.log("Traduzione avviata:", payload);
      alert(`✅ Traduzione completata per articolo ${articleId}!\n🌍 ${payload.translationsCompleted}/${payload.totalLanguages} lingue tradotte`);
    } catch (err) {
      console.error("triggerTranslate error:", err);
      alert(`❌ Errore nel tradurre articolo ${articleId}`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  }

  // Funzione per tradurre articoli solo in inglese
  async function triggerTranslateEnglish(articleId: number | string) {
    setTranslatingItems(prev => new Set(prev).add(articleId));
    try {
      const res = await fetch(`/it/api/translate-articles/${articleId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'english' })
      });
      if (!res.ok) throw new Error(`Errore traduzione: ${res.status}`);
      const payload = await res.json();
      console.log("Traduzione inglese avviata:", payload);
      alert(`✅ Traduzione in inglese completata per articolo ${articleId}!`);
    } catch (err) {
      console.error("triggerTranslateEnglish error:", err);
      alert(`❌ Errore nel tradurre in inglese articolo ${articleId}`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  }

  // Funzione per tradurre destinazioni
  async function triggerTranslateDestination(destinationId: number | string) {
    setTranslatingItems(prev => new Set(prev).add(destinationId));
    try {
      const res = await fetch(`/it/api/translate-destinations/${destinationId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Errore traduzione: ${res.status}`);
      const payload = await res.json();
      console.log("Traduzione destinazione avviata:", payload);
      alert(`✅ Traduzione completata per destinazione ${destinationId}!\n🌍 ${payload.translationsCompleted}/${payload.totalLanguages} lingue tradotte`);
    } catch (err) {
      console.error("triggerTranslateDestination error:", err);
      alert(`❌ Errore nel tradurre destinazione ${destinationId}`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(destinationId);
        return newSet;
      });
    }
  }

  // Funzione per tradurre companies
  async function triggerTranslateCompany(companyId: number | string) {
    setTranslatingItems(prev => new Set(prev).add(companyId));
    try {
      const res = await fetch(`/it/api/translate-companies/${companyId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Errore traduzione: ${res.status}`);
      const payload = await res.json();
      console.log("Traduzione company avviata:", payload);
      alert(`✅ Traduzione completata per company ${companyId}!\n🌍 ${payload.translationsCompleted}/${payload.totalLanguages} lingue tradotte`);
    } catch (err) {
      console.error("triggerTranslateCompany error:", err);
      alert(`❌ Errore nel tradurre company ${companyId}`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  }

  // Funzione per tradurre companies solo in inglese
  async function triggerTranslateCompanyEnglish(companyId: number | string) {
    setTranslatingItems(prev => new Set(prev).add(companyId));
    try {
      const res = await fetch(`/it/api/translate-companies/${companyId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'english' })
      });
      if (!res.ok) throw new Error(`Errore traduzione: ${res.status}`);
      const payload = await res.json();
      console.log("Traduzione inglese company avviata:", payload);
      alert(`✅ Traduzione in inglese completata per company ${companyId}!`);
    } catch (err) {
      console.error("triggerTranslateCompanyEnglish error:", err);
      alert(`❌ Errore nel tradurre in inglese company ${companyId}`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  }

  // Funzione per eliminare tutte le traduzioni di un articolo
  async function deleteAllTranslations(articleId: number | string) {
    const confirm = window.confirm('⚠️ Sei sicuro di voler eliminare TUTTE le traduzioni di questo articolo? (Verrà mantenuta solo la versione italiana)');
    if (!confirm) return;
    
    setTranslatingItems(prev => new Set(prev).add(articleId));
    try {
      const res = await fetch(`/it/api/translate-articles/${articleId}/delete-all`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Errore eliminazione: ${res.status}`);
      const payload = await res.json();
      console.log("Eliminazione traduzioni:", payload);
      alert(`✅ ${payload.message}`);
    } catch (err) {
      console.error("deleteAllTranslations error:", err);
      alert(`❌ Errore nell'eliminare le traduzioni`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  }

  // Funzione per eliminare tutte le traduzioni di una company
  // Funzione per generare URL delle destinazioni
  const getDestinationUrl = (destination: DestinationSummary): string => {
    if (!destination.slug_permalink) return '#';
    
    // Per ora gestiamo solo le regioni dato che fetchDestinations carica solo quelle
    if (destination.type === 'region') {
      return `/it/${destination.slug_permalink}`;
    }
    
    // Per altri tipi, usa lo slug semplice come fallback
    return `/it/${destination.slug_permalink}`;
  };

  async function deleteAllCompanyTranslations(companyId: number | string) {
    const confirm = window.confirm('⚠️ Sei sicuro di voler eliminare TUTTE le traduzioni di questa company? (Verrà mantenuta solo la versione italiana)');
    if (!confirm) return;
    
    setTranslatingItems(prev => new Set(prev).add(companyId));
    try {
      const res = await fetch(`/it/api/translate-companies/${companyId}/delete-all`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Errore eliminazione: ${res.status}`);
      const payload = await res.json();
      console.log("Eliminazione traduzioni company:", payload);
      alert(`✅ ${payload.message}`);
    } catch (err) {
      console.error("deleteAllCompanyTranslations error:", err);
      alert(`❌ Errore nell'eliminare le traduzioni`);
    } finally {
      setTranslatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  }

  // Effetto per filtrare le companies
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.website && company.website.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCompanies(filtered);
    }
    setCompaniesPage(0); // Reset page when search changes
  }, [searchTerm, companies]);

  // Carica i dati in base al tab attivo
  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
    } else if (activeTab === 'destinations') {
      fetchDestinations();
    } else if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [activeTab]);

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              🌐 Gestione Contenuti
            </h1>
            <p className="text-gray-600 text-lg">
              Visualizza, modifica e traduci i tuoi contenuti in 50 lingue
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (activeTab === 'articles') fetchArticles();
                else if (activeTab === 'destinations') fetchDestinations();
                else if (activeTab === 'companies') fetchCompanies();
              }}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Caricamento...
                </>
              ) : (
                <>
                  🔄 Ricarica
                </>
              )}
            </button>
            {activeTab === 'articles' && (
              <Link
                href="/it/reserved/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                ✏️ Nuovo Articolo
              </Link>
            )}
            {activeTab === 'companies' && (
              <Link
                href="/it/reserved/create-company"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🏢 Nuova Company
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'articles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-900 hover:text-gray-900'
            }`}
          >
            📚 Articoli ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'destinations'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-900 hover:text-gray-900'
            }`}
          >
            🏛️ Destinazioni ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'companies'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-900 hover:text-gray-900'
            }`}
          >
            🏢 Aziende ({companies.length})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                {activeTab === 'articles' ? '📄' : activeTab === 'destinations' ? '🏛️' : '🏢'}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeTab === 'articles' ? articles.length : 
                   activeTab === 'destinations' ? destinations.length : 
                   companies.length}
                </div>
                <div className="text-gray-600 text-sm">
                  {activeTab === 'articles' ? 'Articoli' : 
                   activeTab === 'destinations' ? 'Destinazioni' : 
                   'Aziende'} Totali
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                🌍
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50</div>
                <div className="text-gray-600 text-sm">Lingue Supportate</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                🚀
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">AI</div>
                <div className="text-gray-600 text-sm">Traduzione Automatica</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <div className="text-xl font-semibold text-gray-700">
              Caricamento {activeTab === 'articles' ? 'articoli' : activeTab === 'destinations' ? 'destinazioni' : 'aziende'}...
            </div>
            <div className="text-gray-900 mt-2">Recupero dati da Directus</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl mb-6 shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold">
                Errore nel caricamento {activeTab === 'articles' ? 'articoli' : activeTab === 'destinations' ? 'destinazioni' : 'aziende'}:
              </strong>
              <div className="mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <>
              {articles.length > 0 ? (
                <>
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Lista Articoli</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Immagine articolo */}
                            {directusUrl && article.image ? (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <img 
                                  src={`${directusUrl}/assets/${article.image}`}
                                  alt={article.titolo_articolo || "Immagine articolo"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-900 text-2xl flex-shrink-0">
                                📄
                              </div>
                            )}

                            {/* Contenuto articolo */}
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  ID: {article.id}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  article.status === 'published' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  📊 {article.status}
                                </span>
                                <span className="text-gray-900">
                                  📅 {new Date(article.date_created).toLocaleDateString('it-IT')}
                                </span>
                              </div>
                              
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                  {article.titolo_articolo}
                                </h3>
                              </div>

                              {article.slug_permalink && (
                                <div className="text-sm text-blue-600 font-medium">
                                  <a 
                                    href={`/it/magazine/${article.slug_permalink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    🔗 /it/magazine/{article.slug_permalink}
                                  </a>
                                </div>
                              )}

                              {article.seo_summary && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  <strong>Summary:</strong> {article.seo_summary}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex flex-col space-y-3 ml-6">
                            <button
                              onClick={() => triggerTranslate(article.id)}
                              disabled={translatingItems.has(article.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(article.id)
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                              }`}
                            >
                              {translatingItems.has(article.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Traducendo...
                                </>
                              ) : (
                                <>🌍 Traduci 49 lingue</>
                              )}
                            </button>
                            
                            <button
                              onClick={() => triggerTranslateEnglish(article.id)}
                              disabled={translatingItems.has(article.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(article.id)
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                              }`}
                            >
                              {translatingItems.has(article.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Traducendo...
                                </>
                              ) : (
                                <>🇬🇧 Solo inglese</>
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteAllTranslations(article.id)}
                              disabled={translatingItems.has(article.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(article.id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                              }`}
                            >
                              {translatingItems.has(article.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Eliminando...
                                </>
                              ) : (
                                <>🗑️ Elimina traduzioni</>
                              )}
                            </button>
                            
                            <a
                              href={`/it/reserved/edit/${article.id}`}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md text-center"
                            >
                              ✏️ Modifica
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-6">
                    📄
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun articolo trovato</h3>
                  <p className="text-gray-900 mb-6">Non ci sono articoli pubblicati al momento</p>
                  <Link
                    href="/it/reserved/create"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ✏️ Crea il Primo Articolo
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Destinations Tab */}
          {activeTab === 'destinations' && (
            <>
              {destinations.length > 0 ? (
                <>
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Lista Destinazioni</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {destinations.map((destination) => (
                      <div
                        key={destination.id}
                        className="p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Immagine destinazione */}
                            {directusUrl && destination.image ? (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <img 
                                  src={`${directusUrl}/assets/${destination.image}`}
                                  alt={destination.destination_name || "Immagine destinazione"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center text-gray-900 text-2xl flex-shrink-0">
                                🏛️
                              </div>
                            )}

                            {/* Contenuto destinazione */}
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ID: {destination.id}
                                </span>
                                {destination.type && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    📍 {destination.type}
                                  </span>
                                )}
                              </div>
                              
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                                  {destination.destination_name}
                                </h3>
                              </div>

                              {destination.slug_permalink && (
                                <div className="text-sm text-green-600 font-medium">
                                  🔗 <a 
                                    href={getDestinationUrl(destination)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {getDestinationUrl(destination)}
                                  </a>
                                </div>
                              )}

                              {destination.seo_summary && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  <strong>Summary:</strong> {destination.seo_summary}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex flex-col space-y-3 ml-6">
                            <button
                              onClick={() => triggerTranslateDestination(destination.id)}
                              disabled={translatingItems.has(destination.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(destination.id)
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                              }`}
                            >
                              {translatingItems.has(destination.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Traducendo...
                                </>
                              ) : (
                                <>🚀 Traduci</>
                              )}
                            </button>
                            
                            <a
                              href={`/it/reserved/edit-destination/${destination.id}`}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md text-center"
                            >
                              ✏️ Modifica
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination per companies */}
                  {filteredCompanies.length > COMPANIES_PER_PAGE && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Mostrando {companiesPage * COMPANIES_PER_PAGE + 1} - {Math.min((companiesPage + 1) * COMPANIES_PER_PAGE, filteredCompanies.length)} di {filteredCompanies.length} aziende
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCompaniesPage(Math.max(0, companiesPage - 1))}
                            disabled={companiesPage === 0}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                          >
                            Precedente
                          </button>
                          <button
                            onClick={() => setCompaniesPage(Math.min(Math.floor(filteredCompanies.length / COMPANIES_PER_PAGE), companiesPage + 1))}
                            disabled={(companiesPage + 1) * COMPANIES_PER_PAGE >= filteredCompanies.length}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                          >
                            Successivo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-200 to-green-300 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-6">
                    🏛️
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessuna destinazione trovata</h3>
                  <p className="text-gray-900 mb-6">Non ci sono destinazioni al momento</p>
                </div>
              )}
            </>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <>
              {companies.length > 0 ? (
                <>
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">Lista Aziende ({filteredCompanies.length})</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Cerca aziende..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredCompanies
                      .slice(companiesPage * COMPANIES_PER_PAGE, (companiesPage + 1) * COMPANIES_PER_PAGE)
                      .map((company) => (
                      <div
                        key={company.id}
                        className="p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Immagine azienda */}
                            {directusUrl && company.image ? (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                                <img 
                                  src={`${directusUrl}/assets/${company.image}`}
                                  alt={company.company_name || "Immagine company"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl flex items-center justify-center text-gray-900 text-2xl flex-shrink-0">
                                🏢
                              </div>
                            )}

                            {/* Contenuto azienda */}
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  ID: {company.id}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  company.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {company.active ? '✅ Attiva' : '❌ Inattiva'}
                                </span>
                              </div>
                              
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                  {company.company_name}
                                </h3>
                              </div>

                              {company.website && (
                                <div className="text-sm text-purple-600 font-medium">
                                  🌐 {company.website}
                                </div>
                              )}

                              {company.slug_permalink && (
                                <div className="text-sm text-blue-600 font-medium">
                                  <a 
                                    href={`/it/poi/${company.slug_permalink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    🔗 /it/poi/{company.slug_permalink}
                                  </a>
                                </div>
                              )}

                              {company.seo_summary && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  <strong>Summary:</strong> {company.seo_summary}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Azioni */}
                          <div className="flex flex-col space-y-3 ml-6">
                            <button
                              onClick={() => triggerTranslateCompany(company.id)}
                              disabled={translatingItems.has(company.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(company.id)
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                              }`}
                            >
                              {translatingItems.has(company.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Traducendo...
                                </>
                              ) : (
                                <>🌍 Traduci 49 lingue</>
                              )}
                            </button>
                            
                            <button
                              onClick={() => triggerTranslateCompanyEnglish(company.id)}
                              disabled={translatingItems.has(company.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(company.id)
                                  ? 'bg-orange-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                              }`}
                            >
                              {translatingItems.has(company.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Traducendo...
                                </>
                              ) : (
                                <>🇬🇧 Solo inglese</>
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteAllCompanyTranslations(company.id)}
                              disabled={translatingItems.has(company.id)}
                              className={`inline-flex items-center px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md ${
                                translatingItems.has(company.id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                              }`}
                            >
                              {translatingItems.has(company.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Eliminando...
                                </>
                              ) : (
                                <>🗑️ Elimina traduzioni</>
                              )}
                            </button>
                            
                            <a
                              href={`/it/reserved/edit-company/${company.id}`}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md text-center"
                            >
                              ✏️ Modifica
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-6">
                    🏢
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessuna azienda trovata</h3>
                  <p className="text-gray-900 mb-6">Non ci sono aziende al momento</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReservedPage() {
  return <ArticlesList />;
}