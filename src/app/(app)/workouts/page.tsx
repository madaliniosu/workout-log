import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getWorkoutTemplatesForUser } from '@/db/queries/workout-template';
import { getExercisesForUser } from '@/db/queries/exercises';
import { NewWorkoutTemplateButton } from './new-workout-template-button';
import { DeleteWorkoutTemplateButton } from './delete-workout-template-button';
import { EditWorkoutTemplateButton } from './edit-workout-template-button';

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
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-10 pt-10">
        <h1 className="font-heading text-[32px] font-extrabold text-black">
          My Workouts
        </h1>
        <NewWorkoutTemplateButton exercises={exercises} />
      </div>

      <div className="flex flex-wrap gap-6 p-10">
        {templates.map((template) => (
          <div
            key={template.id}
            className="relative w-[320px] overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white"
          >
            <div className="h-2 w-full bg-[#c8ff57]" />
            <div className="flex flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-lg font-semibold text-black">
                  {template.name}
                </p>
                <div className="flex items-start justify-between gap-2">
                    <EditWorkoutTemplateButton
                      template={template}
                      exercises={exercises}
                    />
                    <DeleteWorkoutTemplateButton templateId={template.id} />
                  </div>
              </div>
              {template.notes && (
                <p className="text-sm text-[#666]">{template.notes}</p>
              )}
              <ul className="flex flex-col gap-2">
                {template.exercises.map((exercise) => (
                  <li key={exercise.id} className="text-sm text-[#111111]">
                    <span className="font-medium">{exercise.exerciseName}</span>
                    <span className="text-[#666]">
                      {' '}
                      — {exercise.setCount} sets
                    </span>
                    {exercise.targets.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {exercise.targets.map((target) => (
                          <span
                            key={target.dimension}
                            className="font-heading rounded bg-[#f9f9f9] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#666]"
                          >
                            {target.dimension}: {target.targetValue}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <p className="px-10 text-sm text-gray-500">
          No workouts yet — create your first one above.
        </p>
      )}
    </div>
  );
}
