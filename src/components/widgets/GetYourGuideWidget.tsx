"use client";
import React, { useEffect, useRef } from 'react';

interface GetYourGuideWidgetProps {
  lang: string;
  destinationName: string;
  numberOfItems?: number;
}

const languageMapping: { [key: string]: string } = {
  'it': 'it-IT',
  'en': 'en-US',
  'fr': 'fr-FR',
  'es': 'es-ES',
  'pt': 'pt-PT',
  'de': 'de-DE',
  'tk': 'tr-TR',
  'hu': 'hu-HU',
  'ro': 'ro-RO',
  'nl': 'nl-NL',
  'sv': 'sv-SE',
  'pl': 'pl-PL',
  'vi': 'en-US',
  'id': 'en-US',
  'el': 'el-GR',
  'uk': 'en-US',
  'ru': 'ru-RU',
  'bn': 'en-US',
  'zh': 'zh-CN',
  'hi': 'en-US',
  'ar': 'en-US',
  'fa': 'en-US',
  'ur': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'am': 'en-US',
  'cs': 'cs-CZ',
  'da': 'da-DK',
  'fi': 'fi-FI',
  'af': 'en-US',
  'hr': 'en-US',
  'bg': 'en-US',
  'sk': 'en-US',
  'sl': 'en-US',
  'sr': 'en-US',
  'th': 'en-US',
  'ms': 'en-US',
  'tl': 'en-US',
  'he': 'en-US',
  'ca': 'en-US',
  'et': 'en-US',
  'lv': 'en-US',
  'lt': 'en-US',
  'mk': 'en-US',
  'az': 'en-US',
  'ka': 'en-US',
  'hy': 'en-US',
  'is': 'en-US',
  'sw': 'en-US',
  'zh-tw': 'zh-TW'
};

const GetYourGuideWidget: React.FC<GetYourGuideWidgetProps> = ({ 
  lang, 
  destinationName,
  numberOfItems = 4
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Ricrea il widget quando cambiano le props
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const widgetDiv = document.createElement('div');
      
      // Usa il mapping delle lingue invece della conversione diretta
      const mappedLocale = languageMapping[lang.toLowerCase()] || 'en-US';
      
      widgetDiv.setAttribute('data-gyg-href', 'https://widget.getyourguide.com/default/activities.frame');
      widgetDiv.setAttribute('data-gyg-locale-code', mappedLocale);
      widgetDiv.setAttribute('data-gyg-widget', 'activities');
      widgetDiv.setAttribute('data-gyg-number-of-items', numberOfItems.toString());
      widgetDiv.setAttribute('data-gyg-partner-id', '6JFNZ19');
      widgetDiv.setAttribute('data-gyg-q', destinationName);
      containerRef.current.appendChild(widgetDiv);
    }

    // Aggiungi CSS custom per controllare il layout delle esperienze
    const customCSS = `
      <style>
        .gyg-widget-container iframe {
          width: 100% !important;
        }
        
        /* Mobile: 2 colonne */
        @media (max-width: 767px) {
          .gyg-widget-container .gyg-product-card,
          .gyg-widget-container [class*="product"],
          .gyg-widget-container [class*="card"] {
            width: calc(50% - 8px) !important;
            min-width: calc(50% - 8px) !important;
            max-width: calc(50% - 8px) !important;
            margin: 4px !important;
            display: inline-block !important;
            vertical-align: top !important;
          }
          
          .gyg-widget-container .gyg-product-grid,
          .gyg-widget-container [class*="grid"] {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
          }
        }
        
        /* Tablet: 3 colonne */
        @media (min-width: 768px) and (max-width: 1023px) {
          .gyg-widget-container .gyg-product-card,
          .gyg-widget-container [class*="product"],
          .gyg-widget-container [class*="card"] {
            width: calc(33.333% - 8px) !important;
            min-width: calc(33.333% - 8px) !important;
            max-width: calc(33.333% - 8px) !important;
          }
        }
        
        /* Desktop: 4 colonne */
        @media (min-width: 1024px) {
          .gyg-widget-container .gyg-product-card,
          .gyg-widget-container [class*="product"],
          .gyg-widget-container [class*="card"] {
            width: calc(25% - 8px) !important;
            min-width: calc(25% - 8px) !important;
            max-width: calc(25% - 8px) !important;
          }
        }
      </style>
    `;
    
    // Inserisci CSS nel head
    const head = document.getElementsByTagName('head')[0];
    const existingStyle = document.getElementById('gyg-custom-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    const styleElement = document.createElement('div');
    styleElement.id = 'gyg-custom-style';
    styleElement.innerHTML = customCSS;
    head.appendChild(styleElement);

    return () => {
      document.body.querySelectorAll('script[src*="getyourguide"]').forEach(el => el.remove());
      const customStyle = document.getElementById('gyg-custom-style');
      if (customStyle) {
        customStyle.remove();
      }
    };
  }, [lang, destinationName, numberOfItems]);

  return (
    <div className="my-8">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6">Experiences in {destinationName}</h2>
        <div ref={containerRef} className="gyg-widget-container"></div>
      </div>
    </div>
  );
};

export default GetYourGuideWidget;