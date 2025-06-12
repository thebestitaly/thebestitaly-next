"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'it';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const searchTerm = (form.elements.namedItem('search') as HTMLInputElement).value.trim();
    
    if (searchTerm) {
      const searchPath = `/${lang}/search?q=${encodeURIComponent(searchTerm)}`;
      router.push(searchPath);
    }
  };

  return (
    <div className="h-full flex items-center px-4">
      <form 
        onSubmit={handleSubmit} 
        className="relative"
      >
        <input
          type="text"
          name="search"
          placeholder="Cerca..."
          className="w-48 h-10 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          aria-label="Search"
        />
        <button 
          type="submit" 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 hover:text-blue-600 transition-colors duration-200"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;