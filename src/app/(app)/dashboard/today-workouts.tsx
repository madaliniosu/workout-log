'use client';

type Target = { dimension: string; targetValue: number };
type ScheduledExercise = {
  id: string;
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

export function TodayWorkouts({ workouts }: { workouts: ScheduledWorkout[] }) {
  const todayKey = toDateKey(new Date());
  const todaysWorkouts = workouts.filter((w) => w.scheduledAt.startsWith(todayKey));

  if (todaysWorkouts.length === 0) {
    return <p className="text-gray-500 text-sm">No workouts scheduled for today.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {todaysWorkouts.map((workout) => (
        <div key={workout.id} className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{workout.name}</h3>
            <span className="text-sm text-gray-500">{workout.scheduledAt.slice(11)}</span>
          </div>
          <ul className="text-sm flex flex-col gap-1">
            {workout.exercises.map((exercise) => (
              <li key={exercise.id}>
                {exercise.exerciseName} — {exercise.setCount} sets
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
