import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import { auth } from '@/auth';
import { getExercisesForUser } from '@/db/queries/exercises';
import { CATEGORIES } from '@/lib/validations';
import { AddExerciseButton } from './add-exercise-button';
import { DeleteExerciseButton } from './delete-exercise-button';

const CATEGORY_COLORS: Record<string, string> = {
  Strength: '#c8ff57',
  Cardio: '#ff8a65',
  Flexibility: '#a78bfa',
  HIIT: '#4f70fa',
};

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const exercises = await getExercisesForUser(session.user.id);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-10 pt-10">
        <h1 className="font-heading text-[32px] font-extrabold text-black">Exercises Library</h1>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-[400px] items-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4">
            <Search size={20} strokeWidth={2} color="#666666" />
            <input
              placeholder="Search exercises..."
              className="w-full text-base text-[#111111] placeholder:text-[#666] focus:outline-none"
            />
          </div>
          <AddExerciseButton />
        </div>
      </div>

      <div className="flex gap-3 px-10 pt-6">
        <span className="font-heading rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white">
          All
        </span>
        {CATEGORIES.map((category) => (
          <span
            key={category}
            className="font-heading rounded-full border border-[#e5e5e5] bg-white px-5 py-2.5 text-sm font-semibold text-[#666]"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 p-10">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="relative w-[270px] overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white"
          >
            <div className="h-2 w-full" style={{ backgroundColor: CATEGORY_COLORS[exercise.category] ?? '#c8ff57' }} />
            <div className="flex flex-col gap-2 p-5">
              <div className="flex gap-1.5">
                <span className="font-heading rounded bg-[#e7ffb5] px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
                  {exercise.category}
                </span>
                {exercise.muscleGroup && (
                  <span className="font-heading rounded bg-[#f9f9f9] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#666]">
                    {exercise.muscleGroup}
                  </span>
                )}
              </div>
              <p className="font-heading text-lg font-semibold text-black">{exercise.name}</p>
            </div>
            <DeleteExerciseButton exerciseId={exercise.id} />
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <p className="px-10 text-sm text-gray-500">No exercises yet — add your first one above.</p>
      )}
    </div>
  );
}
