import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getExercisesForUser } from '@/db/queries/exercises';
import { getWorkoutSessionWithSets } from '@/db/queries/workouts';
import { EditWorkoutForm } from './edit-workout-form';

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const [workout, exercises] = await Promise.all([
    getWorkoutSessionWithSets(id, session.user.id),
    getExercisesForUser(session.user.id),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <div className="max-w-lg mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-4">Edit workout</h1>
      <EditWorkoutForm workout={workout} exercises={exercises} />
    </div>
  );
}
