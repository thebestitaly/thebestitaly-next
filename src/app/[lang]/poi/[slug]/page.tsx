import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import directusWebClient from '../../../../lib/directus-web';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import CompanyDestinationBox from '@/components/destinations/CompanyDestinationBox';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LatestArticles from '@/components/magazine/LatestArticles';
import GoogleMaps from '@/components/widgets/GoogleMaps';
import VideoEmbed from '@/components/widgets/VideoEmbed';
import ImageGallery from '@/components/companies/ImageGallery';
import RelatedPOI from '@/components/companies/RelatedPOI';
import JsonLdSchema from '@/components/widgets/JsonLdSchema';
import { getTranslation } from '@/lib/translations-server';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

// 🚀 ISR: Rigenera la pagina ogni 4 ore (14400 secondi) - le singole companies cambiano ancora meno
export const revalidate = 14400;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

// Custom components for ReactMarkdown
const markdownComponents = {
  h2: ({ node, ...props }: any) => {
    const text = props.children?.toString() || '';
    // Remove any markdown formatting from the text
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links, keep text
    
    const id = cleanText.toLowerCase().replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
    return <h2 id={id} {...props} />;
  },
  h3: ({ node, ...props }: any) => {
    const text = props.children?.toString() || '';
    // Remove any markdown formatting from the text
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic
      .replace(/`(.*?)`/g, '$1')       // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links, keep text
    
    const id = cleanText.toLowerCase().replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
    return <h3 id={id} {...props} />;
  },
  a: ({ href, children, ...props }: any) => {
    // Check if the link is a video URL
    if (href && (
      href.includes('youtube.com/watch') ||
      href.includes('youtu.be/') ||
      href.includes('vimeo.com/') ||
      href.match(/\.(mp4|webm|ogg)$/i)
    )) {
      return (
        <div className="my-6">
          <VideoEmbed 
            src={href} 
            title={typeof children === 'string' ? children : 'Video'} 
            className="w-full"
          />
        </div>
      );
    }
    
    // Regular link
    return (
      <a 
        href={href} 
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:text-blue-700 underline"
        {...props}
      >
        {children}
      </a>
    );
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  
  try {
    const company = await directusWebClient.getCompanyBySlug(slug, lang);
    
    if (!company) {
      return {
        title: 'Eccellenza non trovata | TheBestItaly',
        description: 'La eccellenza richiesta non è stata trovata.',
      };
    }

    const translation = company.translations?.[0];
    
    // Fallback to English if current language fields are empty
    let englishTranslation = null;
    if (lang !== 'en' && (!translation?.seo_title || !translation?.seo_summary)) {
      try {
        const englishCompany = await directusWebClient.getCompanyBySlug(slug, 'en');
        englishTranslation = englishCompany?.translations?.[0];
      } catch (error) {
        console.error('Error fetching English translation:', error);
      }
    }
    
    // Generate proper canonical URL for this POI page
    const canonicalUrl = generateCanonicalUrl(lang, ['poi', slug]);
    
    // Get hreflang links
    const hreflangs = {}; // TODO: Implement getCompanyHreflang function
    
    // Ensure we have a proper meta description
    const metaDescription = translation?.seo_summary || 
                          englishTranslation?.seo_summary || 
                          `Discover ${company.company_name}, one of the best Italian excellences selected by TheBestItaly. Experience authentic Italian quality and tradition.`;
    
    // Check if we're using English fallback (page not fully translated)
    const isUsingEnglishFallback = Boolean(lang !== 'en' && (!translation?.description || !translation?.seo_title || !translation?.seo_summary) && englishTranslation);
    
        // Schema is now handled by JsonLdSchema component in the page render
     
     return generateSEO({
      title: `${translation?.seo_title || englishTranslation?.seo_title || company.company_name} | TheBestItaly`,
      description: metaDescription,
      type: 'article',
      canonicalUrl,
      hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
      noindex: isUsingEnglishFallback, // Add noindex if using English fallback
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Errore | TheBestItaly',
      description: 'Si è verificato un errore nel caricamento della pagina.',
    };
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const { lang, slug } = await params;

  try {
    const company = await directusWebClient.getCompanyBySlug(slug, lang);

    if (!company) {
      notFound();
    }

    const translation = company.translations?.[0];
    
    // Fallback to English if current language fields are empty
    let englishTranslation = null;
    let isUsingEnglishFallback = false;
    if (lang !== 'en' && (!translation?.seo_title || !translation?.seo_summary || !translation?.description)) {
      try {
        const englishCompany = await directusWebClient.getCompanyBySlug(slug, 'en');
        englishTranslation = englishCompany?.translations?.[0];
        if (englishTranslation && (englishTranslation.description || englishTranslation.seo_title || englishTranslation.seo_summary)) {
          isUsingEnglishFallback = true;
        }
      } catch (error) {
        console.error('Error fetching English translation:', error);
      }
    }

    // Generate schema for JSON-LD
    const getBusinessType = (categoryId: number) => {
      switch (categoryId) {
        case 1: return "LodgingBusiness";
        case 2: return "Restaurant"; 
        case 3: return "TouristAttraction";
        default: return "LocalBusiness";
      }
    };

    const pageSchema = {
      "@context": "https://schema.org",
      "@type": getBusinessType(Number(company.category_id) || 0),
      "name": company.company_name,
      "description": translation?.seo_summary || englishTranslation?.seo_summary || `Discover ${company.company_name}, one of the best Italian excellences selected by TheBestItaly.`,
      "url": `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/poi/${slug}`,
      "image": company.featured_image ? `${process.env.NEXT_PUBLIC_APP_URL}${getOptimizedImageUrl(company.featured_image, 'HERO_DESKTOP')}` : null,
      "telephone": company.phone || null,
      "website": company.website || null,
      "address": company.destination_id ? {
        "@type": "PostalAddress",
        "addressCountry": "IT",
        "addressRegion": "Italy"
      } : null,
      "geo": (company.lat && company.long && Number(company.lat) !== 0 && Number(company.long) !== 0) ? {
        "@type": "GeoCoordinates",
        "latitude": Number(company.lat),
        "longitude": Number(company.long)
      } : null,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "1"
      },
      "priceRange": Number(company.category_id) === 2 ? "€€" : null,
      "servesCuisine": Number(company.category_id) === 2 ? "Italian" : null
    };

    // Remove null values from schema
    Object.keys(pageSchema).forEach(key => {
      if (pageSchema[key as keyof typeof pageSchema] === null || pageSchema[key as keyof typeof pageSchema] === undefined) {
        delete pageSchema[key as keyof typeof pageSchema];
      }
    });
    
    // Get destination coordinates for the map
    let destination = null;
    if (company.destination_id) {
      try {
        destination = await directusWebClient.getDestinationByUUID(company.destination_id.toString(), lang);
      } catch (error) {
        console.error('Error fetching destination for map:', error);
      }
    }

    return (
      <div className="min-h-screen">
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-link"
          aria-label="Salta al contenuto principale"
        >
          Salta al contenuto
        </a>
        
        {/* JSON-LD Schema */}
        <JsonLdSchema schema={pageSchema} />
        
        {/* Script to modify HTML lang attribute when using English fallback */}
        {isUsingEnglishFallback && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  if (typeof document !== 'undefined') {
                    document.documentElement.setAttribute('lang', 'en');
                    document.documentElement.setAttribute('dir', 'ltr');
                    document.documentElement.setAttribute('class', 'font-sans');
                  }
                })();
              `
            }}
          />
        )}
        
        {/* Breadcrumb - Always on top */}
        <div className="px-4 pt-4">
          <Breadcrumb />
        </div>
        
        {/* Language Fallback Notice */}
        {isUsingEnglishFallback && (
          <div className="container mx-auto px-4 pt-2 pb-0">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    This page is not yet available in this language. The displayed content is in English.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header Section - Responsive */}
        <div className="container mx-auto px-4 pt-4 pb-0 ">
          {/* Company Name - Responsive */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tighter">
            {company.company_name}
          </h1>
          
          {/* SEO Summary responsive */}
          {(translation?.seo_summary || englishTranslation?.seo_summary) && (
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
              {translation?.seo_summary || englishTranslation?.seo_summary}
            </p>
          )}
          
          {/* Quick Actions - Responsive */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {company.website && (
              <Link
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-white font-semibold px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm md:text-base"
                style={{ backgroundColor: '#0066cc' }}
                aria-label={`Visita il sito web di ${company.company_name} (si apre in una nuova finestra)`}
              >
                <Globe className="w-4 h-4 md:w-5 md:h-5 mr-2" aria-hidden="true" />
                Visita Sito Web
              </Link>
            )}
            
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 md:border-gray-400 text-gray-700 font-semibold rounded-lg md:rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 text-sm md:text-base"
                aria-label={`Chiama ${company.company_name} al numero ${company.phone}`}
              >
                <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                Chiama
              </a>
            )}
          </div>
        </div>
        
        {/* Hero Image - Responsive */}
        {company.featured_image && (
          <div className="px-4 mt-6 md:mt-12">
            <div className="container mx-auto relative poi-hero-image mb-4 md:mb-8 overflow-hidden rounded-xl md:rounded-2xl">
              <Image
                src={getOptimizedImageUrl(company.featured_image, 'HERO_DESKTOP')}
                alt={`${company.company_name} - Immagine principale che mostra l'ambiente e l'atmosfera`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div id="main-content" className="container mx-auto py-6 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
           
            {/* Main Content */}
            <div className="lg:col-span-2 px-4 md:px-0">
              {/* Image Gallery */}
              {(company.featured_image || (company.images && company.images.length > 0)) && (
                <ImageGallery 
                  images={company.images || []}
                  companyName={company.company_name}
                  featuredImage={company.featured_image}
                />
              )}
              
              {/* Description */}
              {(translation?.description || englishTranslation?.description) && (
                <article className="prose prose-base md:prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:hover:text-blue-700">
                  <ReactMarkdown components={markdownComponents}>{translation?.description || englishTranslation?.description}</ReactMarkdown>
                </article>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 md:space-y-8 px-4 md:px-0">
              {/* Contact Info - Hidden on mobile since buttons are in header */}
              <div className="hidden md:block rounded-2xl p-6">
                <div className="space-y-4">
                  {company.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Sito Web</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 break-all"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Telefono</p>
                        <a
                          href={`tel:${company.phone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              

              {/* Related POI */}
              {company.destination_id && (
                <RelatedPOI 
                  currentCompanyId={company.id}
                  destinationId={company.destination_id} 
                  lang={lang} 
                />
              )}

              {/* Destination Box */}
              {company.destination_id && (
                <CompanyDestinationBox 
                  destinationId={company.destination_id} 
                  lang={lang} 
                />
              )}

              {/* CTA */}
              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                  Vuoi promuovere la tua eccellenza?
                </h3>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm">
                  Unisciti alle migliori eccellenze italiane presenti su TheBestItaly
                </p>
                <Link
                  href="/it/landing"
                  className="inline-block w-full text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors duration-200 font-semibold text-center hover:opacity-90 text-sm md:text-base"
                  style={{ backgroundColor: '#0066cc' }}
                >
                  Richiedi Informazioni
                </Link>
              </div>

              {/* Google Maps */}
              {(company.lat && company.long && Number(company.lat) !== 0 && Number(company.long) !== 0) && (
                <div className="rounded-xl md:rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Position</h3>
                  <GoogleMaps 
                    lat={Number(company.lat)} 
                    lng={Number(company.long)} 
                    name={company.company_name}
                    height="300px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Articles Section */}
          <div className="mt-8 md:mt-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  {await getTranslation('featured_articles', 'general', lang)}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                  Scopri gli ultimi articoli e consigli di viaggio
                </p>
              </div>
              <LatestArticles lang={lang} />
            </div>
          </div>

        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading company:', error);
    notFound();
  }
}