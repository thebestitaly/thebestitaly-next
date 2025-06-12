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
import VideoEmbed from '@/components/widgets/VideoEmbed';

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
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
      };
    }

    const translation = article.translations[0];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not defined in environment variables');
    }
    
    const canonicalUrl = `${baseUrl}/${lang}/magazine/${slug}`;
    const imageUrl = article.image 
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`
      : `${baseUrl}/images/default-og.jpg`;

    // Schema markup for structured data
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": translation?.titolo_articolo || '',
      "description": translation?.seo_summary || '',
      "datePublished": article.date_created,
      "dateModified": article.date_created,
      "author": {
        "@type": "Person",
        "name": "TheBestItaly"
      },
      "image": imageUrl,
      "url": canonicalUrl
    };

    return {
      title: translation?.titolo_articolo || 'Article',
      description: translation?.seo_summary || 'Read our latest article',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: translation?.titolo_articolo || 'Article',
        description: translation?.seo_summary || 'Read our latest article',
        type: 'article',
        url: canonicalUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: translation?.titolo_articolo || 'Article image',
          },
        ],
        publishedTime: article.date_created,
        modifiedTime: article.date_created,
        authors: ['TheBestItaly'],
        section: 'Travel',
      },
      twitter: {
        card: 'summary_large_image',
        title: translation?.titolo_articolo || 'Article',
        description: translation?.seo_summary || 'Read our latest article',
        images: [imageUrl],
      },
      other: {
        'application/ld+json': JSON.stringify(schema),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article',
      description: 'Read our latest article',
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
      {/* Mobile Header - Studenti.it style */}
      <div className="md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {translation?.titolo_articolo}
          </h1>
          {translation?.seo_summary && (
            <p className="text-base text-gray-600 mb-4">
              {translation.seo_summary}
            </p>
          )}
          
          {/* Hero Image - Mobile */}
          {article.image && (
            <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl">
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                alt={translation?.titolo_articolo || ''}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {/* TOC - Table of Contents */}
          <div className="rounded-lg mb-6">
            <TableOfContents content={translation?.description || ''} />
          </div>
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden md:block relative h-64 sm:h-80 lg:h-[500px]">
        {/* Desktop: Image with overlay */}
        {article.image && (
          <div className="absolute inset-0 m-4 sm:m-6 lg:m-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
              alt={translation?.titolo_articolo || ''}
              fill
              className="object-cover rounded-lg sm:rounded-xl lg:rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl" />
          </div>
        )}
        
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-6 sm:pb-8 lg:pb-12">
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white leading-tight mb-2 sm:mb-3 lg:mb-4">{translation?.titolo_articolo}</h1>
              {translation?.seo_summary && <p className="text-sm sm:text-base lg:text-2xl font-light text-white/90 mb-4 sm:mb-6 leading-relaxed">{translation.seo_summary}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb - Desktop only */}
      <div className="hidden md:block">
        <ArticleBreadcrumb />
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          <div className="lg:col-span-2">
            <div className="rounded-lg p-2 mb-4 md:mb-0">
              <GetYourGuideWidget 
                lang={lang} 
                destinationName="Italy"
              />
            </div>

            {/* Video Section - Uncomment when video_url field is added to database */}
            {/* {article.video_url && (
              <div className="mb-8">
                <VideoEmbed 
                  src={article.video_url} 
                  title={translation?.titolo_articolo || 'Video'} 
                  className="w-full"
                />
              </div>
            )} */}

            <article className="prose prose-base md:prose-lg max-w-none mt-4 md:mt-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => {
                    const id = props.children?.toString().toLowerCase().replace(/\W+/g, '-');
                    return <h2 id={id} {...props} />;
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
                  // Custom video component for YouTube/Vimeo links
                  a: ({ node, ...props }) => {
                    const href = props.href as string;
                    const isVideo = href && (
                      href.includes('youtube.com') || 
                      href.includes('youtu.be') || 
                      href.includes('vimeo.com') ||
                      href.match(/\.(mp4|webm|ogg)$/i)
                    );
                    
                    if (isVideo) {
                      return (
                        <VideoEmbed 
                          src={href} 
                          title={props.children?.toString() || 'Video'} 
                          className="my-6"
                        />
                      );
                    }
                    
                    return <a {...props} className="text-blue-600 hover:text-blue-800 underline" />;
                  },
                }}
              >
                {translation?.description || ''}
              </ReactMarkdown>
            </article>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-16 space-y-4 md:space-y-6">
              {/* Desktop TOC */}
              <div className="hidden md:block">
                <TableOfContents content={translation?.description || ''} />
              </div>
              <ArticlesSidebar lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}