"use client";
import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    console.log('TableOfContents useEffect triggered');
    const updateHeadings = () => {
      if (!contentRef.current) {
        console.log('No contentRef.current available');
        return;
      }

      
      const elements = contentRef.current.querySelector('.prose')?.querySelectorAll('h2, h3, h4');
      console.log('Prose content:', contentRef.current.querySelector('.prose')?.innerHTML);
      
      const elementDetails = elements ? Array.from(elements).map(el => ({
        id: el.id,
        text: el.textContent,
        tagName: el.tagName
      })) : [];
      
      const items = Array.from(elements || []).map((element) => ({
        id: element.id || element.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
        level: Number(element.tagName.charAt(1)),
        text: element.textContent || ''
      }));

      console.log('Created TOC items:', items);
      setHeadings(items);
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Intersection observed:', entry.target.id);
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '-20% 0% -35% 0%' }
      );

      elements?.forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    };

    const checkForHeadings = () => {
      console.log('Checking for headings...');
      if (!contentRef.current?.querySelector('h2, h3, h4')) {
        console.log('No headings found, retrying...');
        setTimeout(checkForHeadings, 100);
      } else {
        console.log('Headings found, updating...');
        updateHeadings();
      }
    };

    checkForHeadings();
  }, [contentRef]);

  console.log('Current headings state:', headings);
  console.log('Current active ID:', activeId);

  return (
    <nav className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h4 className="text-lg font-semibold mb-4">Table of Contents</h4>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 text-sm hover:text-blue-600 transition-colors
                ${activeId === heading.id ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;