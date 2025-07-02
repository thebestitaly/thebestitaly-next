import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// 🚀 CRITICAL DEPLOY: Memory fix 1024MB - 2025-01-22 v1.0.1
export default async function Home() {
  // Get the user's preferred language from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const preferredLanguage = acceptLanguage?.split(',')[0].split('-')[0] || 'en';

  // Redirect to the localized version
  redirect(`/${preferredLanguage}`);
}