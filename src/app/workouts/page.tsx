import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getWorkoutSessionsForUser } from '@/db/queries/workouts';

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const sessions = await getWorkoutSessionsForUser(session.user.id);

  return (
    <div className="max-w-lg mx-auto mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Workout history</h1>
        <Link href="/workouts/new" className="text-sm underline">
          + Log a workout
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/workouts/${s.id}`} className="border rounded p-2 block hover:bg-gray-50">
              {new Date(s.date).toLocaleDateString()}
              {s.notes && <span className="text-gray-500 text-sm"> — {s.notes}</span>}
            </Link>
          </li>
        ))}
        {sessions.length === 0 && <p className="text-gray-500 text-sm">No workouts logged yet.</p>}
      </ul>
    </div>
  );
}
