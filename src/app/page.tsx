import { redirect } from 'next/navigation';

// 🚀 ADMIN: Redirect directly to admin dashboard
export default async function Home() {
  // Admin panel doesn't need language routing - redirect directly to reserved area
  redirect('/reserved');
}