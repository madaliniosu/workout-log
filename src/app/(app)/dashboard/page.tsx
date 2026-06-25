import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserById } from '@/db/queries/users';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await getUserById(session.user.id);

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-6">Welcome, {user.name}</h1>
    </div>
  );
}
