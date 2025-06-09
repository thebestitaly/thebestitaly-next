import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Phone, Mail, Globe, ArrowLeft } from 'lucide-react';
import directusClient from '../../../../lib/directus';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

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
    
    return generateSEO({
      title: `${translation?.seo_title || company.company_name} | TheBestItaly`,
      description: translation?.seo_summary || `Scopri ${company.company_name}, una delle eccellenze italiane selezionate da TheBestItaly.`,
      type: 'article',
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

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900">
          {/* Background Image */}
          {company.featured_image && (
            <div className="absolute inset-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${company.featured_image}`}
                alt={company.company_name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">
              {/* Back Button */}
              <Link
                href={`/${lang}/eccellenze`}
                className="inline-flex items-center mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tutte le Eccellenze
              </Link>

              <div className="max-w-4xl">
                {/* Category/Type */}
                <div className="text-amber-200 text-sm font-medium mb-4 tracking-widest uppercase">
                  🏆 Eccellenza Italiana
                </div>

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
                <div className="flex flex-wrap items-center gap-4">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center px-6 py-3 bg-white text-amber-900 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-300 shadow-lg"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      <span>Visita Sito Web</span>
                      <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
                    </a>
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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Summary */}
              {translation?.seo_summary && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">In Breve</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {translation.seo_summary}
                  </p>
                </div>
              )}

              {/* Description */}
              {translation?.description && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Descrizione Completa</h2>
                  <div className="prose prose-lg max-w-none text-gray-600">
                    {translation.description.split('\n').map((paragraph: string, index: number) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contatti</h3>
                <div className="space-y-4">
                  {company.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Sito Web</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-700 break-all"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a
                          href={`mailto:${company.email}`}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Telefono</p>
                        <a
                          href={`tel:${company.phone}`}
                          className="text-amber-600 hover:text-amber-700"
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Galleria</h3>
                  <div className="grid grid-cols-2 gap-4">
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

              {/* CTA */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Vuoi promuovere la tua eccellenza?
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Unisciti alle migliori eccellenze italiane presenti su TheBestItaly
                </p>
                <Link
                  href={`/${lang}/contact`}
                  className="inline-block w-full bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold"
                >
                  Contattaci
                </Link>
              </div>
            </div>
          </div>

          {/* Related/Other Excellence */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Altre Eccellenze</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Scopri altre eccellenze italiane selezionate per te
              </p>
            </div>
            
            <div className="text-center">
              <Link
                href={`/${lang}/eccellenze`}
                className="inline-flex items-center px-8 py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all duration-300 shadow-lg"
              >
                <span className="mr-2">Esplora Tutte le Eccellenze</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
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