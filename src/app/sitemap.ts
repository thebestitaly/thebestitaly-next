import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://thebestitaly.it'
  const languages = ['it', 'en', 'fr', 'de', 'es']
  
  // Base pages
  const pages = [
    '',
    '/magazine',
    '/eccellenze',
    '/experience',
  ]

  const staticUrls: MetadataRoute.Sitemap = []

  // Add base URLs for each language
  languages.forEach(lang => {
    pages.forEach(page => {
      staticUrls.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: page === '' ? 1 : 0.8,
      })
    })
  })

  return staticUrls
} 