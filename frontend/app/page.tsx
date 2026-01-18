import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { LoginCard } from '../components/login-card';
import { authOptions } from '../lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <LoginCard />
    </main>
  );
}
