type CompletedSet = { setNumber: number; dimension: string; value: number };
type Target = { dimension: string; targetValue: number };
type WorkoutExercise = {
  id: string;
  exerciseName: string;
  setCount: number;
  targets: Target[];
  completedSets: CompletedSet[];
};
type Workout = { id: string; name: string; completedAt: Date | null; exercises: WorkoutExercise[] };

function labelFor(dimension: string) {
  return dimension.charAt(0).toUpperCase() + dimension.slice(1);
}

function unitFor(dimension: string) {
  return dimension === 'weight' ? 'kg' : '';
}

export function HistoryTab({ workouts }: { workouts: Workout[] }) {
  return (
    <div className="flex flex-col gap-4">
      {workouts.length === 0 && <p className="text-gray-500 text-sm">No completed workouts yet.</p>}

      {workouts.map((workout) => (
        <div key={workout.id} className="border rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">{workout.name}</h2>
            <span className="text-sm text-gray-500">
              {workout.completedAt ? new Date(workout.completedAt).toLocaleString() : ''}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id}>
                <h3 className="text-sm font-medium mb-1">{exercise.exerciseName}</h3>
                <div className="flex flex-col gap-1">
                  {Array.from({ length: exercise.setCount }, (_, i) => i + 1).map((setNumber) => {
                    const setRows = exercise.completedSets.filter((cs) => cs.setNumber === setNumber);
                    const rpeRow = setRows.find((cs) => cs.dimension === 'rpe');

                    return (
                      <div key={setNumber} className="flex gap-3 items-center flex-wrap text-xs">
                        <span className="text-gray-500 w-12">Set {setNumber}</span>
                        {exercise.targets.map((target) => {
                          const actual = setRows.find((cs) => cs.dimension === target.dimension);
                          return (
                            <span key={target.dimension}>
                              {labelFor(target.dimension)}: {target.targetValue}
                              {unitFor(target.dimension)} planned
                              {actual ? ` → ${actual.value}${unitFor(target.dimension)} actual` : ' (not logged)'}
                            </span>
                          );
                        })}
                        {rpeRow && <span>RPE: {rpeRow.value}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
