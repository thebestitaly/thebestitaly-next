import { NextRequest, NextResponse } from 'next/server';
import directusWebClient from '@/lib/directus-web';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const resolvedParams = await params;
    const { uuid } = resolvedParams;
    
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'it';
    
    console.log(`🏢 API: Fetching company by UUID: ${uuid} (lang: ${lang})`);
    
    // Dobbiamo creare anche getCompanyByUUID in directus.ts
    // Per ora usiamo una query diretta
    const response = await directusWebClient.get('/items/companies', {
      params: {
        'filter[uuid_id][_eq]': uuid,
        'fields': [
          'id',
          'uuid_id',
          'company_name',
          'website',
          'phone',
          'lat',
          'long',
          'featured_image',
          'slug_permalink',
          'category_id.uuid_id',
          'translations.description',
          'translations.seo_title',
          'translations.seo_summary'
        ],
        'deep[translations][_filter][languages_code][_eq]': lang
      }
    });
    
    const company = response.data?.data?.[0];
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Response pubblica sicura
    const publicCompany = {
      uuid_id: company.uuid_id,
      name: company.company_name,
      website: company.website,
      phone: company.phone,
      description: company.translations[0]?.description,
      slug: company.slug_permalink,
      image: company.featured_image,
      
      // Coordinate (se pubbliche)
      location: company.lat && company.long ? {
        lat: company.lat,
        lng: company.long
      } : null,
      
      // UUID delle relazioni
      category_uuid: company.category_id?.uuid_id,
      
      // URL pubblico (slug-based)
      public_url: `/${lang}/poi/${company.slug_permalink}`,
      
      // API links (UUID-based)
      api_links: {
        self: `/api/companies/uuid/${company.uuid_id}`,
        category: company.category_id?.uuid_id ? `/api/categories/uuid/${company.category_id.uuid_id}` : null
      }
    };
    
    return NextResponse.json(publicCompany);
    
  } catch (error) {
    console.error('Error in company UUID API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 