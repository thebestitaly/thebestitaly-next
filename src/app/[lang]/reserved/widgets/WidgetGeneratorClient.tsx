"use client";

import React, { useState, useEffect } from "react";

// Lingue supportate: Italiano + le 47 lingue specificate
const ALL_LANGUAGES = [
  'it', 'en', 'fr', 'es', 'pt', 'de', 'nl', 'ro', 'sv', 'pl', 'vi', 'id', 'el', 'uk', 'ru', 'bn', 
  'zh', 'hi', 'ar', 'fa', 'ur', 'ja', 'ko', 'am', 'cs', 'da', 'fi', 'af', 'hr', 'bg', 'sk', 'sl', 
  'sr', 'th', 'ms', 'tl', 'he', 'ca', 'et', 'lv', 'lt', 'mk', 'az', 'ka', 'hy', 'is', 'sw', 'zh-tw', 'tk', 'hu'
];

// Nomi delle lingue per display
const LANGUAGE_NAMES: Record<string, string> = {
  'it': 'Italian',
  'en': 'English',
  'fr': 'French', 
  'es': 'Spanish',
  'pt': 'Portuguese',
  'de': 'German',
  'nl': 'Dutch',
  'ro': 'Romanian',
  'sv': 'Swedish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'el': 'Greek',
  'uk': 'Ukrainian',
  'ru': 'Russian',
  'bn': 'Bengali',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'fa': 'Persian',
  'ur': 'Urdu',
  'ja': 'Japanese',
  'ko': 'Korean',
  'am': 'Amharic',
  'cs': 'Czech',
  'da': 'Danish',
  'fi': 'Finnish',
  'af': 'Afrikaans',
  'hr': 'Croatian',
  'bg': 'Bulgarian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sr': 'Serbian',
  'th': 'Thai',
  'ms': 'Malay',
  'tl': 'Tagalog',
  'he': 'Hebrew',
  'ca': 'Catalan',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'az': 'Azerbaijani',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'is': 'Icelandic',
  'sw': 'Swahili',
  'zh-tw': 'Chinese (Traditional)',
  'tk': 'Turkmen',
  'hu': 'Hungarian'
};

interface Destination {
  id: string;
  slug: string;
  slugMap: { [key: string]: string };
  name: string;
  type: string;
}

interface Company {
  id: string;
  slug: string;
  name: string;
}

interface WidgetGeneratorClientProps {
  lang: string;
}

export default function WidgetGeneratorClient({ lang }: WidgetGeneratorClientProps) {
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("destination");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['it', 'en', 'fr', 'de', 'es']);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [widgetSize, setWidgetSize] = useState("medium");
  const [widgetTheme, setWidgetTheme] = useState("light");
  const [testMode, setTestMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Rest of the component logic will be added here...
  // For now, let's add a basic render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🛠️ Widget Generator
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Genera widget personalizzati per TheBestItaly
        </p>
        {/* Widget generator content will be added */}
      </div>
    </div>
  );
} 