"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const formatLabel = (slug: string): string =>
  slug.replace(/-/g, " ").toUpperCase();

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();

  // Estrai i segmenti dal pathname
  const pathSegments = pathname?.split("/").filter(Boolean) || [];

  // Recupera la lingua dal primo segmento o usa 'it' come fallback
  const lang = pathSegments[0] || "it";
  
  // Generazione dinamica del breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [];

  // Se siamo nella sezione companies
  if (pathSegments[1] === "companies") {
    breadcrumbs.push({
      label: "ECCELLENZE",
      path: `/${lang}/companies`,
    });
    
    // Se siamo su una singola company
    if (pathSegments[2]) {
      breadcrumbs.push({
        label: formatLabel(pathSegments[2]),
        path: `/${lang}/companies/${pathSegments[2]}`,
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

  return (
    <nav aria-label="breadcrumb" className="py-4 bg-gray-100">
      <div className="container mx-auto px-4">
        <ol className="list-reset flex text-sm text-gray-700">
          {/* Home */}
          <li>
            <Link
              href={`/${lang}`}
              className="hover:underline transition duration-150 ease-in-out"
            >
              HOME
            </Link>
          </li>

          {/* Dynamic Crumbs */}
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center">
              <span className="mx-2 text-gray-500">/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="hover:underline transition duration-150 ease-in-out"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;