import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getExercisesForUser } from '@/db/queries/exercises';
import { ExercisesContent } from './exercises-content';

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const exercises = await getExercisesForUser(session.user.id);

  return <ExercisesContent exercises={exercises} />;
}
