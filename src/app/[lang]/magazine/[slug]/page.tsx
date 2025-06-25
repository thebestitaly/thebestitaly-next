import React from 'react';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import directusClient from '@/lib/directus';
import GetYourGuideWidget from '@/components/widgets/GetYourGuideWidget';
import ArticlesSidebar from '@/components/widgets/ArticlesSidebar';
import TableOfContents from '@/components/widgets/TableOfContents';
import ArticleDestinationBox from '@/components/destinations/ArticleDestinationBox';
import { getArticleHreflang } from '@/lib/directus';
import { generateMetadata as generateSEO } from '@/components/widgets/seo-utils';
import JsonLdSchema from '@/components/widgets/JsonLdSchema';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, slug } = resolvedParams;
  
  try {
    const article = await directusClient.getArticleBySlug(slug, lang);
    
    if (!article) {
      // Create meaningful fallback based on slug
      const articleTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        title: `${articleTitle} | TheBestItaly`,
        description: `Discover ${articleTitle.toLowerCase()} - Read our latest travel article about Italy on TheBestItaly magazine.`,
      };
    }

    const translation = article.translations[0];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not defined in environment variables');
    }
    
    const canonicalUrl = `${baseUrl}/${lang}/magazine/${slug}`;
    
    // Get hreflang links
    const hreflangs = await getArticleHreflang(article.id);
    
    // Ensure we have a proper meta description with better fallback
    const metaDescription = translation?.seo_summary || 
                          (translation?.titolo_articolo ? `${translation.titolo_articolo} - Read our latest travel article about Italy on TheBestItaly magazine.` : '') ||
                          `Discover ${slug.replace(/-/g, ' ')} - Read our latest travel article about Italy on TheBestItaly magazine.`;
    
    const imageUrl = article.image 
      ? `${baseUrl}${getOptimizedImageUrl(article.image, 'HERO_DESKTOP')}`
      : `${baseUrl}/images/default-og.jpg`;

    // Improved schema markup for article
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": translation?.titolo_articolo || '',
      "description": metaDescription,
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Organization",
        "name": "TheBestItaly",
        "url": "https://thebestitaly.eu"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TheBestItaly",
        "url": "https://thebestitaly.eu",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/logo.png`,
          "width": 200,
          "height": 60
        }
      },
      "datePublished": article.date_created,
      "dateModified": article.date_created,
      "url": canonicalUrl,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "articleSection": article.category_id?.translations?.[0]?.nome_categoria || "Travel",
      "keywords": "Italy, travel, tourism, destinations, magazine",
      "sameAs": Object.values(hreflangs)
    };

    return generateSEO({
      title: translation?.titolo_articolo || 'Article',
      description: metaDescription,
      type: 'article',
      canonicalUrl,
      hreflangs: Object.keys(hreflangs).length > 0 ? hreflangs : undefined,
      article: {
        publishedTime: article.date_created,
        modifiedTime: article.date_created,
        author: 'TheBestItaly',
        category: article.category_id?.translations?.[0]?.nome_categoria || 'Travel'
      },
      schema,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Create meaningful fallback based on slug even in error case
    const articleTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: `${articleTitle} | TheBestItaly`,
      description: `Discover ${articleTitle.toLowerCase()} - Read our latest travel article about Italy on TheBestItaly magazine.`,
    };
  }
}

export default async function MagazineArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { lang, slug } = resolvedParams;

  let article;
  try {
    article = await directusClient.getArticleBySlug(slug, lang);
  } catch (error) {
    console.error('Error fetching article:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Error loading article</h1>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Article not found</h1>
        </div>
      </div>
    );
  }

  const translation = article.translations[0];
  const categoryTranslation = article.category_id?.translations?.[0];
  
  // Generate schema for article
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thebestitaly.eu';
  const canonicalUrl = `${baseUrl}/${lang}/magazine/${slug}`;
  const imageUrl = article.image 
    ? `${baseUrl}${getOptimizedImageUrl(article.image, 'HERO_DESKTOP')}`
    : `${baseUrl}/images/default-og.jpg`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": translation?.titolo_articolo || '',
    "description": translation?.seo_summary || `${translation?.titolo_articolo} - Read our latest travel article about Italy on TheBestItaly magazine.`,
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Organization",
      "name": "TheBestItaly",
      "url": "https://thebestitaly.eu"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TheBestItaly",
      "url": "https://thebestitaly.eu",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 60
      }
    },
    "datePublished": article.date_created,
    "dateModified": article.date_created,
    "url": canonicalUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": article.category_id?.translations?.[0]?.nome_categoria || "Travel",
    "keywords": "Italy, travel, tourism, destinations, magazine"
  };

  // Custom Breadcrumb Component for Articles
  const ArticleBreadcrumb = () => (
    <nav aria-label="breadcrumb" className="py-4 bg-gray-100">
      <div className="container mx-auto px-4">
        <ol className="flex flex-wrap items-start text-sm text-gray-700 gap-1 sm:gap-2">
          <li className="flex items-center shrink-0">
            <Link
              href={`/${lang}`}
              className="hover:underline transition duration-150 ease-in-out"
            >
              HOME
            </Link>
            <span className="mx-1 sm:mx-2 text-gray-600">/</span>
          </li>
          <li className="flex items-center shrink-0">
            <Link
              href={`/${lang}/magazine`}
              className="hover:underline transition duration-150 ease-in-out"
            >
              MAGAZINE
            </Link>
            <span className="mx-1 sm:mx-2 text-gray-600">/</span>
          </li>
          {categoryTranslation?.nome_categoria && (
            <li className="flex items-center shrink-0">
              <Link
                href={`/${lang}/magazine/c/${categoryTranslation.slug_permalink || categoryTranslation.nome_categoria.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:underline transition duration-150 ease-in-out"
              >
                {categoryTranslation.nome_categoria.toUpperCase()}
              </Link>
              <span className="mx-1 sm:mx-2 text-gray-600">/</span>
            </li>
          )}
          <li className="min-w-0 break-words">
            <span className="font-semibold text-gray-900 leading-tight">
              {translation?.titolo_articolo?.toUpperCase() || 'ARTICLE'}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );

  return (
    <div>
      <JsonLdSchema schema={schema} />
      
      {/* Breadcrumb - Always on top */}
      <ArticleBreadcrumb />
      
      {/* Header Section - Mobile: Stack, Desktop: Side by side */}
      <div className="container mx-auto px-4 pt-6 ">
        <div className="flex flex-col md:flex-row md:items-start md:gap-8 lg:gap-12">
          {/* Title and Subtitle - Left side on desktop (40%) */}
          <div className="w-full md:w-half mb-6 md:mb-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-grey-600 mb-2 tracking-tighter">
              {translation?.titolo_articolo}
            </h1>
            {translation?.seo_summary && (
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4">
                {translation.seo_summary}
              </p>
            )}
          </div>
          
          {/* Hero Image - Right side on desktop (60%) */}
          {article.image && (
            <div className="w-full md:w-half">
              <div className="relative aspect-[16/9] md:aspect-[4/3] lg:aspect-[1/1] overflow-hidden rounded-xl md:rounded-2xl">
                <Image
                  src={getOptimizedImageUrl(article.image, 'HERO_DESKTOP')}
                  alt={translation?.titolo_articolo || ''}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* TOC - Table of Contents - Mobile only here */}
      <div className="md:hidden px-4 ">
        <div className="hidden md:block sticky top-16 z-10 mb-10">
          <TableOfContents content={translation?.description || ''} />
        </div>
        
        {/* Destination Box - Mobile */}
        {article.destination_id && (
          <div className="mb-6">
            <ArticleDestinationBox 
              destinationId={article.destination_id} 
              lang={lang} 
            />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          <div className="lg:col-span-2">
            <article className="prose prose-base md:prose-lg max-w-none">
              {(() => {
                let h2Count = 0;
                const content = translation?.description || '';
                
                return (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ node, ...props }) => {
                        h2Count++;
                        const id = props.children?.toString().toLowerCase().replace(/\W+/g, '-');
                        
                        return (
                          <>
                            {h2Count === 2 && (
                              <div className="not-prose my-8">
                                <div className="rounded-lg p-2">
                                  <GetYourGuideWidget 
                                    lang={lang} 
                                    destinationName="Italy"
                                  />
                                </div>
                              </div>
                            )}
                            <h2 id={id} {...props} />
                          </>
                        );
                      },
                      h3: ({ node, ...props }) => {
                        const id = props.children?.toString().toLowerCase().replace(/\W+/g, '-');
                        return <h3 id={id} {...props} />;
                      },
                      img: ({ node, ...props }) => (
                        <div className="relative w-full h-64 md:h-96">
                          <Image
                            src={typeof props.src === 'string' ? props.src : ''}
                            alt={props.alt || ''}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 800px"
                          />
                        </div>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                );
              })()}
            </article>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-16 space-y-4 md:space-y-6">
              {/* Desktop TOC */}
              <div className="hidden md:block">
                <TableOfContents content={translation?.description || ''} />
              </div>
              
              {/* Destination Box - Show only if article has a destination */}
              {article.destination_id && (
                <ArticleDestinationBox 
                  destinationId={article.destination_id} 
                  lang={lang} 
                />
              )}
              
                              <ArticlesSidebar 
                  lang={lang} 
                  currentArticleId={article.id}
                  categoryId={article.category_id?.id}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}