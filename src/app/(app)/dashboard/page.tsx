import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getScheduledWorkoutsForUser, getScheduledWorkoutsWithExercisesForUser } from '@/db/queries/scheduled-workouts';
import { getWorkoutTemplatesForUser } from '@/db/queries/workout-template';
import { PlanView } from './plan-view';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [scheduledWorkouts, detailedWorkouts, templates] = await Promise.all([
    getScheduledWorkoutsForUser(session.user.id),
    getScheduledWorkoutsWithExercisesForUser(session.user.id),
    getWorkoutTemplatesForUser(session.user.id),
  ]);

  return (
    <PlanView
      scheduledWorkouts={scheduledWorkouts}
      detailedWorkouts={detailedWorkouts}
      templates={templates.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
