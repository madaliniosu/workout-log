import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getScheduledWorkoutsForUser } from '@/db/queries/scheduled-workouts';
import { getWorkoutTemplatesForUser } from '@/db/queries/workout-template';
import { CalendarView } from './calendar-view';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [scheduledWorkouts, templates] = await Promise.all([
    getScheduledWorkoutsForUser(session.user.id),
    getWorkoutTemplatesForUser(session.user.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-6">Calendar</h1>
      <CalendarView
        scheduledWorkouts={scheduledWorkouts}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
