"use client";
import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      let text = match[2].trim();
      
      // Remove any markdown formatting from the text (like **bold**, *italic*, etc.)
      text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
      text = text.replace(/\*(.*?)\*/g, '$1');     // Remove italic
      text = text.replace(/`(.*?)`/g, '$1');       // Remove code
      text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links, keep text
      
      // Generate ID exactly like ReactMarkdown does
      const id = text.toLowerCase().replace(/\W+/g, '-').replace(/^-+|-+$/g, '');
      
      items.push({ id, text, level });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by their position in the document
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Get the topmost visible entry
          const sortedEntries = visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(sortedEntries[0].target.id);
        }
      },
      { 
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0.1
      }
    );

    // Observe all headings with a small delay to ensure DOM is ready
    const observeHeadings = () => {
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.observe(element);
        }
      });
    };

    if (tocItems.length > 0) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(observeHeadings, 100);
    }

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Get the header height to account for sticky headers
      const headerHeight = 80; // Adjust based on your header height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update active ID immediately for better UX
      setActiveId(id);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-gray-100 rounded-2xl p-6 shadow-lg">
        <nav className="space-y-2">
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`block w-full text-left text-md transition-colors hover:text-blue-600 ${
                item.level === 2 ? 'font-medium' : 'ml-4 font-normal'
              } ${
                activeId === item.id
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;