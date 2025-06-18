"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSectionTranslations } from '@/hooks/useTranslations';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const formatLabel = (slug: string): string =>
  slug.replace(/-/g, " ").toUpperCase();

interface BreadcrumbProps {
  variant?: 'default' | 'mobile';
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ variant = 'default' }) => {
  const pathname = usePathname();

  // Estrai i segmenti dal pathname
  const pathSegments = pathname?.split("/").filter(Boolean) || [];

  // Recupera la lingua dal primo segmento o usa 'it' come fallback
  const lang = pathSegments[0] || "it";
  
  // Fetch traduzioni per il breadcrumb
  const { translations: menuTranslations } = useSectionTranslations('menu', lang);
  
  // Generazione dinamica del breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [];

  // Se siamo nella sezione magazine
  if (pathSegments[1] === "magazine") {
    breadcrumbs.push({
      label: (menuTranslations?.magazine || "MAGAZINE").toUpperCase(),
      path: `/${lang}/magazine`,
    });
    
    // Se siamo in una categoria del magazine (/magazine/c/category-slug)
    if (pathSegments[2] === "c" && pathSegments[3]) {
      breadcrumbs.push({
        label: formatLabel(pathSegments[3]),
        path: `/${lang}/magazine/c/${pathSegments[3]}`,
      });
    }
    // Se siamo su un articolo del magazine (/magazine/article-slug)
    else if (pathSegments[2] && pathSegments[2] !== "c") {
      // Per ora mettiamo una categoria generica - si può migliorare prendendo la categoria dall'articolo
      breadcrumbs.push({
        label: "ARTICOLI",
        path: `/${lang}/magazine`,
      });
      breadcrumbs.push({
        label: formatLabel(pathSegments[2]),
        path: `/${lang}/magazine/${pathSegments[2]}`,
      });
    }
  }
  // Se siamo nella sezione companies
  else if (pathSegments[1] === "companies" || pathSegments[1] === "poi") {
    breadcrumbs.push({
      label: "ECCELLENZE",
      path: `/${lang}/poi`,
    });
    
    // Se siamo su una singola company
    if (pathSegments[2]) {
      breadcrumbs.push({
        label: formatLabel(pathSegments[2]),
        path: `/${lang}/poi/${pathSegments[2]}`,
      });
    }
  } 
  // Se siamo nella sezione eccellenze
  else if (pathSegments[1] === "eccellenze") {
    breadcrumbs.push({
      label: "ECCELLENZE",
      path: `/${lang}/poi`,
    });
    
    // Se siamo su una singola eccellenza
    if (pathSegments[2]) {
      breadcrumbs.push({
        label: formatLabel(pathSegments[2]),
        path: `/${lang}/poi/${pathSegments[2]}`,
      });
    }
  } else {
    // Logica originale per le destinazioni
    const regionSlug = pathSegments[1];
    const provinceSlug = pathSegments[2];
    const municipalitySlug = pathSegments[3];

    // Aggiungi Regione
    if (regionSlug) {
      breadcrumbs.push({
        label: formatLabel(regionSlug),
        path: `/${lang}/${regionSlug}`,
      });
    }

    // Aggiungi Provincia
    if (provinceSlug) {
      breadcrumbs.push({
        label: formatLabel(provinceSlug),
        path: `/${lang}/${regionSlug}/${provinceSlug}`,
      });
    }

    // Aggiungi Municipality
    if (municipalitySlug) {
      breadcrumbs.push({
        label: formatLabel(municipalitySlug),
        path: `/${lang}/${regionSlug}/${provinceSlug}/${municipalitySlug}`,
      });
    }
  }

  const isMobile = variant === 'mobile';
  
  return (
    <nav aria-label="breadcrumb" className={isMobile ? "py-2" : "py-4 bg-gray-100"}>
      <div className={isMobile ? "" : "container mx-auto px-4"}>
        <ol className={`list-reset flex flex-wrap items-start gap-1 sm:gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>
          {/* Home */}
          <li className="flex items-center shrink-0">
            <Link
              href={`/${lang}`}
              className="hover:underline transition duration-150 ease-in-out"
            >
              {(menuTranslations?.home || "HOME").toUpperCase()}
            </Link>
            <span className="mx-1 sm:mx-2 text-gray-600">/</span>
          </li>

          {/* Dynamic Crumbs */}
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center shrink-0">
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900 leading-tight break-words">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.path}
                    className="hover:underline transition duration-150 ease-in-out"
                  >
                    {crumb.label}
                  </Link>
                  <span className="mx-1 sm:mx-2 text-gray-600">/</span>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;