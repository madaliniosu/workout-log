import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserById } from '@/db/queries/users';
import { logout } from './actions';
import { UpdateNameForm } from './update-name-form';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await getUserById(session.user.id);

  return (
    <div className="max-w-md mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">Settings</h1>
        <UpdateNameForm currentName={user.name} />
      </div>
      <form action={logout}>
        <button type="submit" className="bg-black text-white rounded p-2">
          Sign out
        </button>
      </form>
    </div>
  );
}
