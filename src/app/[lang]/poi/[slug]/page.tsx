import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Phone, Mail, Globe, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import directusClient from '../../../../lib/directus';
import { generateMetadata as generateSEO, generateCanonicalUrl } from '@/components/widgets/seo-utils';
import CompanyDestinationBox from '@/components/destinations/CompanyDestinationBox';
import Breadcrumb from '@/components/layout/Breadcrumb';
import LatestArticles from '@/components/magazine/LatestArticles';
import GoogleMaps from '@/components/widgets/GoogleMaps';
import VideoEmbed from '@/components/widgets/VideoEmbed';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

// Custom components for ReactMarkdown
const markdownComponents = {
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
    const company = await directusClient.getCompanyBySlug(slug, lang);
    
    if (!company) {
      return {
        title: 'Eccellenza non trovata | TheBestItaly',
        description: 'La eccellenza richiesta non è stata trovata.',
      };
    }

    const translation = company.translations?.[0];
    
    // Generate proper canonical URL for this POI page
    const canonicalUrl = generateCanonicalUrl(lang, ['poi', slug]);
    
    return generateSEO({
      title: `${translation?.seo_title || company.company_name} | TheBestItaly`,
      description: translation?.seo_summary || `Scopri ${company.company_name}, una delle eccellenze italiane selezionate da TheBestItaly.`,
      type: 'article',
      canonicalUrl,
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
    const company = await directusClient.getCompanyBySlug(slug, lang);

    if (!company) {
      notFound();
    }

    const translation = company.translations?.[0];
    
    // Get destination coordinates for the map
    let destination = null;
    if (company.destination_id) {
      try {
        destination = await directusClient.getDestinationById(company.destination_id.toString(), lang);
      } catch (error) {
        console.error('Error fetching destination for map:', error);
      }
    }

    return (
      <div className="min-h-screen">
        {/* Mobile Header - Studenti.it style */}
        <div className="md:hidden">
          {/* Breadcrumb Mobile */}
          <div className="px-4 pt-4">
            <Breadcrumb variant="mobile" />
          </div>
          
          <div className="px-4 pt-4 pb-0">
            {/* Company Name - Bigger */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {company.company_name}
            </h1>
            
            {/* SEO Summary instead of SEO Title */}
            {translation?.seo_summary && (
              <p className="text-base text-gray-600 mb-4">
                {translation.seo_summary}
              </p>
            )}
            
            {/* Quick Actions - Mobile */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {company.website && (
                <Link
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90 text-sm"
                  style={{ backgroundColor: '#0066cc' }}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Visita Sito Web
                </Link>
              )}
              
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Chiama
                </a>
              )}
            </div>
          </div>
          
          {/* Hero Image - Mobile - Attached to bottom with same side margins */}
          {company.featured_image && (
            <div className="px-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                <Image
                  src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                  alt={company.company_name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Hero Section */}
        <div className="hidden md:block relative h-96 lg:h-[500px]">
          {/* Background Image */}
          {company.featured_image && (
            <div className="absolute inset-0 m-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                alt={company.company_name}
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">
             
              <div className="max-w-4xl">
                
                {/* Company Name */}
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-none mb-4">
                  {company.company_name}
                </h1>

                {/* SEO Title */}
                {translation?.seo_title && (
                  <p className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">
                    {translation.seo_title}
                  </p>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  {company.website && (
                    <Link
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:opacity-90"
                      style={{ backgroundColor: '#0066cc' }}
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Visita Sito Web
                    </Link>
                  )}
                  
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Chiama
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb - Desktop only */}
        <div className="hidden md:block">
          <Breadcrumb />
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-6 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 px-4 md:px-0">
              {/* Description */}
              {translation?.description && (
                <article className="prose prose-base md:prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:hover:text-blue-700">
                  <ReactMarkdown components={markdownComponents}>{translation.description}</ReactMarkdown>
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

              {/* Additional Images */}
              {company.images && company.images.length > 0 && (
                <div className="rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {company.images.slice(0, 4).map((image: any, index: number) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.directus_files_id}`}
                          alt={`${company.company_name} - Immagine ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
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
                  href="/it/contact"
                  className="inline-block w-full text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors duration-200 font-semibold text-center hover:opacity-90 text-sm md:text-base"
                  style={{ backgroundColor: '#0066cc' }}
                >
                  Richiedi Informazioni
                </Link>
              </div>

              {/* Google Maps */}
              {destination && destination.lat && destination.long && destination.lat !== 0 && destination.long !== 0 && (
                <div className="rounded-xl md:rounded-2xl p-4 md:p-6">
                  <GoogleMaps 
                    lat={destination.lat} 
                    lng={destination.long} 
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
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Articoli Correlati</h2>
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