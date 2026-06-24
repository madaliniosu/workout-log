import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getExercisesForUser } from '@/db/queries/exercises';
import { NewWorkoutForm } from './new-workout-form';

export default async function NewWorkoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const exercises = await getExercisesForUser(session.user.id);

  return (
    <div className="max-w-lg mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-4">Log a workout</h1>
      <NewWorkoutForm exercises={exercises} />
    </div>
  );
}
