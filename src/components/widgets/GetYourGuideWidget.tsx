
"use client";
import React, { useEffect, useRef } from 'react';

interface GetYourGuideWidgetProps {
  lang: string;
  destinationName: string;
  numberOfItems?: number;
}

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
      widgetDiv.setAttribute('data-gyg-href', 'https://widget.getyourguide.com/default/activities.frame');
      widgetDiv.setAttribute('data-gyg-locale-code', `${lang}-${lang.toUpperCase()}`);
      widgetDiv.setAttribute('data-gyg-widget', 'activities');
      widgetDiv.setAttribute('data-gyg-number-of-items', numberOfItems.toString());
      widgetDiv.setAttribute('data-gyg-partner-id', '6JFNZ19');
      widgetDiv.setAttribute('data-gyg-q', destinationName);
      containerRef.current.appendChild(widgetDiv);
    }

    return () => {
      document.body.querySelectorAll('script[src*="getyourguide"]').forEach(el => el.remove());
    };
  }, [lang, destinationName, numberOfItems]);

  return (
    <div className="my-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Experiences in {destinationName}</h2>
        <div ref={containerRef} className="gyg-widget-container"></div>
      </div>
    </div>
  );
};

export default GetYourGuideWidget;