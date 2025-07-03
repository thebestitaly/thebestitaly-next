import { redirect } from 'next/navigation';

export default async function AdminHomePage({ 
  params 
}: { 
  params: { lang: string } 
}) {
  // 🔒 ADMIN APP: Redirect to admin dashboard
  redirect(`/${params.lang}/reserved`);
}