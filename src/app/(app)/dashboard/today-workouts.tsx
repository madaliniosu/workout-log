'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Target = { dimension: string; targetValue: number };
type ScheduledExercise = {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  setCount: number;
  targets: Target[];
};
type ScheduledWorkout = {
  id: string;
  name: string;
  scheduledAt: string;
  exercises: ScheduledExercise[];
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function labelFor(dimension: string) {
  return dimension.charAt(0).toUpperCase() + dimension.slice(1);
}

function unitFor(dimension: string) {
  return dimension === 'weight' ? 'kg' : '';
}

export function TodayWorkouts({ workouts }: { workouts: ScheduledWorkout[] }) {
  const router = useRouter();
  const todayKey = toDateKey(new Date());
  const todaysWorkouts = workouts.filter((w) => w.scheduledAt.startsWith(todayKey));

  if (todaysWorkouts.length === 0) {
    return <p className="text-gray-500 text-sm">No workouts scheduled for today.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {todaysWorkouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} onLogged={() => router.refresh()} />
      ))}
    </div>
  );
}

type Values = Record<string, Record<number, Record<string, string>>>;

function WorkoutCard({ workout, onLogged }: { workout: ScheduledWorkout; onLogged: () => void }) {
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState<Values>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateValue(exerciseRowId: string, setNumber: number, dimension: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [exerciseRowId]: {
        ...prev[exerciseRowId],
        [setNumber]: {
          ...prev[exerciseRowId]?.[setNumber],
          [dimension]: value,
        },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const sets = workout.exercises.flatMap((exercise) =>
      Array.from({ length: exercise.setCount }, (_, i) => i + 1).flatMap((setNumber) =>
        exercise.targets.map((target) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          setNumber,
          dimension: target.dimension,
          value: values[exercise.id]?.[setNumber]?.[target.dimension] ?? '',
        }))
      )
    );

    setPending(true);
    const res = await fetch(`/api/scheduled-workouts/${workout.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sets }),
    });
    setPending(false);

    if (res.ok) {
      onLogged();
    } else {
      setError('Failed to log workout.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{workout.name}</h3>
        <span className="text-sm text-gray-500">{workout.scheduledAt.slice(11)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={started}
          onClick={() => setStarted(true)}
          className="bg-black text-white rounded p-2 disabled:opacity-50 px-4"
        >
          Start workout
        </button>
        <button
          type="submit"
          disabled={!started || pending}
          className="border rounded p-2 disabled:opacity-50 px-4"
        >
          {pending ? 'Completing...' : 'Complete workout'}
        </button>
      </div>

      {started &&
        workout.exercises.map((exercise) => (
          <div key={exercise.id} className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">{exercise.exerciseName}</h4>
            {Array.from({ length: exercise.setCount }, (_, i) => i + 1).map((setNumber) => (
              <div key={setNumber} className="flex gap-3 items-center flex-wrap text-xs border-b pb-2">
                <span className="text-gray-500 w-12">Set {setNumber}</span>
                {exercise.targets.map((target) =>
                  target.dimension === 'rpe' ? (
                    <label key={target.dimension} className="flex items-center gap-1">
                      RPE
                      <input
                        type="number"
                        step="any"
                        value={values[exercise.id]?.[setNumber]?.[target.dimension] ?? ''}
                        onChange={(e) => updateValue(exercise.id, setNumber, target.dimension, e.target.value)}
                        required
                        className="border rounded p-1 w-16"
                      />
                    </label>
                  ) : (
                    <label key={target.dimension} className="flex items-center gap-1">
                      <span className="text-gray-500">
                        Planned {labelFor(target.dimension)}: {target.targetValue}
                        {unitFor(target.dimension)}
                      </span>
                      Actual {labelFor(target.dimension)}
                      <input
                        type="number"
                        step="any"
                        value={values[exercise.id]?.[setNumber]?.[target.dimension] ?? ''}
                        onChange={(e) => updateValue(exercise.id, setNumber, target.dimension, e.target.value)}
                        required
                        className="border rounded p-1 w-16"
                      />
                    </label>
                  )
                )}
              </div>
            ))}
          </div>
        ))}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
