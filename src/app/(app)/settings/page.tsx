import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { logout } from './actions';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <form action={logout}>
        <button type="submit" className="bg-black text-white rounded p-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
