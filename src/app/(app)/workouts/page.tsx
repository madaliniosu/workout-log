import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getWorkoutTemplatesForUser } from '@/db/queries/workout-template';
import { getExercisesForUser } from '@/db/queries/exercises';
import { NewWorkoutTemplateButton } from './new-workout-template-button';
import { DeleteWorkoutTemplateButton } from './delete-workout-template-button';

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [templates, exercises] = await Promise.all([
    getWorkoutTemplatesForUser(session.user.id),
    getExercisesForUser(session.user.id),
  ]);

  return (
    <div className="max-w-3xl mx-auto mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Workouts</h1>
        <NewWorkoutTemplateButton exercises={exercises} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium">{template.name}</h2>
              <DeleteWorkoutTemplateButton templateId={template.id} />
            </div>
            {template.notes && <p className="text-gray-500 text-sm mb-2">{template.notes}</p>}
            <ul className="text-sm flex flex-col gap-1">
              {template.exercises.map((exercise) => (
                <li key={exercise.exerciseId}>
                  {exercise.exerciseName} — {exercise.setCount} sets
                </li>
              ))}
            </ul>
          </div>
        ))}
        {templates.length === 0 && <p className="text-gray-500 text-sm">No workouts yet.</p>}
      </div>
    </div>
  );
}
