import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getExercisesForUser } from '@/db/queries/exercises';
import { AddExerciseForm } from './add-exercise-form';

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const exercises = await getExercisesForUser(session.user.id);

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-4">Exercises</h1>
      <ul className="flex flex-col gap-2 mb-6">
        {exercises.map((exercise) => (
          <li key={exercise.id} className="border rounded p-2">
            {exercise.name}
            {exercise.muscleGroup && <span className="text-gray-500 text-sm"> ({exercise.muscleGroup})</span>}
          </li>
        ))}
      </ul>
      <AddExerciseForm />
    </div>
  );
}
