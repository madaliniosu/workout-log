import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getWorkoutTemplatesForUser } from '@/db/queries/workout-template';
import { getExercisesForUser } from '@/db/queries/exercises';
import { PlanView } from './plan-view';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [templates, exercises] = await Promise.all([
    getWorkoutTemplatesForUser(session.user.id),
    getExercisesForUser(session.user.id),
  ]);

  return (
    <PlanView
      templates={templates.map((t) => ({ id: t.id, name: t.name }))}
      fullTemplates={templates}
      exercises={exercises.map((e) => ({ id: e.id, name: e.name, dimensions: e.dimensions }))}
    />
  );
}
