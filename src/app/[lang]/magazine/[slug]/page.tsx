"use client";

import React, { useRef, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import remarkGfm from 'remark-gfm';
import directusClient from '@/lib/directus';
import Breadcrumb from '@/components/layout/Breadcrumb';
import GetYourGuideWidget from '@/components/widgets/GetYourGuideWidget';
import ArticlesSidebar from '@/components/widgets/ArticlesSidebar';
import TableOfContents from '@/components/widgets/TableOfContents';
import Seo from '@/components/widgets/Seo';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export default function MagazineArticlePage({ params }: PageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);
  const resolvedParams = use(params);
  const { lang, slug } = resolvedParams;

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug, lang],
    queryFn: () => directusClient.getArticleBySlug(slug, lang),
    enabled: isClient && !!slug,
  });

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
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

  // Configurazione Schema Markup
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
    "image": article.image
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`
      : undefined,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/magazine/${slug}`
  };

  return (
    <>
      <Seo
        title={translation?.titolo_articolo || 'Article'}
        description={translation?.seo_summary || 'Read our latest article'}
        image={
          article.image
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`
            : undefined
        }
        type="article"
        article={{
          publishedTime: article.date_created,
          modifiedTime: article.date_created,
          author: 'TheBestItaly',
          category: 'Travel',
        }}
        schema={schema}  // Passa lo schema al componente Seo
      />

      <div>
        <div className="relative h-80 lg:h-[500px]">
          {article.image && (
            <div className="absolute inset-0 m-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${article.image}`}
                alt={translation?.titolo_articolo || ''}
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
            </div>
          )}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-4xl">
                <h1 className="text-3xl lg:text-5xl font-black text-white leading-none mb-4">{translation?.titolo_articolo}</h1>
                {translation?.seo_summary && <p className="text-xl lg:text-2xl font-light text-white/90 mb-6 leading-relaxed">{translation.seo_summary}</p>}
              </div>
            </div>
          </div>
        </div>

        <Breadcrumb />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="rounded-lg p-2">
                <GetYourGuideWidget 
                  lang={lang} 
                  destinationName="Italy"
                />
              </div>

              <article className="prose prose-lg max-w-none mt-8" ref={contentRef}>
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
                          src={props.src || ''}
                          alt={props.alt || ''}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 800px"
                        />
                      </div>
                    ),
                  }}
                >
                  {translation?.description || ''}
                </ReactMarkdown>
              </article>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-16 space-y-6">
                <TableOfContents content={translation?.description || ''} />
                <ArticlesSidebar lang={lang} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}