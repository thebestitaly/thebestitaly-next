import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default function Home() {
  // Get the user's preferred language from Accept-Language header
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language');
  const preferredLanguage = acceptLanguage?.split(',')[0].split('-')[0] || 'en';

  // Redirect to the localized version
  redirect(`/${preferredLanguage}`);
}