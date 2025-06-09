"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import directusClient from '@/lib/directus';

interface CompanyFilterProps {
  onFilterChange: (filters: any) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['company-categories'],
    queryFn: () => directusClient.getCompanyCategories('it'), // Default language
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    updateFilters(category, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    updateFilters(selectedCategory, term);
  };

  const updateFilters = (category: string, search: string) => {
    const filters: any = {};

    if (category) {
      filters.category_id = { _eq: category };
    }

    if (search) {
      filters._or = [
        { 'translations.name': { _contains: search } },
        { 'translations.description': { _contains: search } }
      ];
    }

    onFilterChange(filters);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories?.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.translations[0]?.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search companies..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default CompanyFilter;