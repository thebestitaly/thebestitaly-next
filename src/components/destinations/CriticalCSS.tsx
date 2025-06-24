import React from 'react';

const CriticalCSS: React.FC = () => {
  return (
    <style jsx>{`
      /* Critical CSS per Destination Pages - Inline per LCP */
      .destination-hero {
        width: 100%;
        height: 240px;
        position: relative;
        overflow: hidden;
        border-radius: 0.75rem;
        margin-bottom: 1rem;
      }
      
      @media (min-width: 768px) {
        .destination-hero {
          height: auto;
          aspect-ratio: 21/9;
          border-radius: 1rem;
          margin-bottom: 2rem;
        }
      }
      
      @media (min-width: 1024px) {
        .destination-hero {
          aspect-ratio: 5/2;
        }
      }
      
      .destination-title {
        font-size: 3rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.75rem;
        margin-top: 0.75rem;
        letter-spacing: -0.025em;
        line-height: 1;
      }
      
      @media (min-width: 640px) {
        .destination-title {
          font-size: 2.25rem;
        }
      }
      
      @media (min-width: 768px) {
        .destination-title {
          font-size: 3rem;
        }
      }
      
      @media (min-width: 1024px) {
        .destination-title {
          font-size: 3.75rem;
        }
      }
      
      .destination-summary {
        font-size: 1.125rem;
        color: #4b5563;
        margin-bottom: 1rem;
      }
      
      @media (min-width: 640px) {
        .destination-summary {
          font-size: 1.25rem;
        }
      }
      
      @media (min-width: 768px) {
        .destination-summary {
          font-size: 1.5rem;
        }
      }
      
      /* Preload hint for images */
      .destination-image {
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
      
      /* Skeleton loading states with fixed dimensions */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Layout stabilization */
      .content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      @media (min-width: 1024px) {
        .content-grid {
          grid-template-columns: 2fr 1fr;
          gap: 5rem;
        }
      }
      
      /* Performance hints */
      img[loading="lazy"] {
        content-visibility: auto;
      }
      
      /* Mobile-first approach */
      .mobile-hidden {
        display: none;
      }
      
      @media (min-width: 768px) {
        .mobile-hidden {
          display: block;
        }
      }
    `}</style>
  );
};

export default CriticalCSS; 