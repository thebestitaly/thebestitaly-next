"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { extractLanguageFromPath, isRTLLanguage } from '@/lib/i18n';

export default function HtmlLangUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract language from current pathname
    const lang = extractLanguageFromPath(pathname || '/');
    const isRTL = isRTLLanguage(lang);
    const dir = isRTL ? 'rtl' : 'ltr';

    // Update HTML attributes immediately
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.setAttribute('lang', lang);
      htmlElement.setAttribute('dir', dir);
      htmlElement.setAttribute('class', 'font-sans');
    }

    // Optional: Log for debugging
    console.log(`🌍 HTML updated: lang="${lang}" dir="${dir}" for path: ${pathname}`);
  }, [pathname]);

  // This component doesn't render anything visible
  return null;
} 