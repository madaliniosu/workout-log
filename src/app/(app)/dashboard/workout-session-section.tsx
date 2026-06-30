'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SelectWorkoutModal } from './select-workout-modal';
import { AddExerciseModal } from './add-exercise-modal';

type ExerciseOption = { id: string; name: string; dimensions: string[] };
type FullTemplate = {
  id: string;
  name: string;
  exercises: {
    id: string;
    exerciseId: string | null;
    exerciseName: string;
    setCount: number;
    targets: { dimension: string; targetValue: number }[];
  }[];
};

type SetRow = {
  key: string;
  actuals: Record<string, string>;
};

export type SessionExercise = {
  key: string;
  exerciseId: string | null;
  exerciseName: string;
  dimensions: string[];
  plannedTargets: Record<string, string>;
  sets: SetRow[];
};


function newSetRow(): SetRow {
  return { key: crypto.randomUUID(), actuals: {} };
}

export function WorkoutSessionSection({
  exercises: exercises,
  fullTemplates: fullTemplates,
}: {
  exercises: ExerciseOption[];
  fullTemplates: FullTemplate[];
}) {
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    [],
  );
  const [isSelectWorkoutOpen, setIsSelectWorkoutOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  function removeExercise(key: string) {
    setSessionExercises((prev) => prev.filter((e) => e.key !== key));
  }

  function duplicateSet(exerciseKey: string, setKey: string) {
    setSessionExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.key !== exerciseKey) return exercise;
        const idx = exercise.sets.findIndex((s) => s.key === setKey);
        if (idx === -1) return exercise;
        const updated = [...exercise.sets];
        updated.splice(idx + 1, 0, newSetRow());
        return { ...exercise, sets: updated };
      }),
    );
  }

  function deleteSet(exerciseKey: string, setKey: string) {
    setSessionExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.key !== exerciseKey) return exercise;
        if (exercise.sets.length <= 1) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.filter((s) => s.key !== setKey),
        };
      }),
    );
  }

  function updateActual(
    exerciseKey: string,
    setKey: string,
    dimension: string,
    value: string,
  ) {
    setSessionExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.key !== exerciseKey) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((s) =>
            s.key !== setKey
              ? s
              : { ...s, actuals: { ...s.actuals, [dimension]: value } },
          ),
        };
      }),
    );
  }

  function addExercises(toAdd: SessionExercise[]) {
    setSessionExercises((prev) => [...prev, ...toAdd]);
  }

  function addExercise(toAdd: SessionExercise) {
    setSessionExercises((prev) => [...prev, toAdd]);
  }

  async function handleSaveSession() {
    if (sessionExercises.length === 0) return;
    setSaving(true);
    const res = await fetch('/api/workout-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Workout Session',
        exercises: sessionExercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          exerciseOrder: idx,
          plannedTargets: Object.entries(ex.plannedTargets)
            .filter(([, v]) => v !== '')
            .map(([dimension, targetValue]) => ({
              dimension,
              targetValue: Number(targetValue),
            })),
          sets: ex.sets.map((set) =>
            Object.fromEntries(
              Object.entries(set.actuals)
                .filter(([, v]) => v !== '')
                .map(([k, v]) => [k, Number(v)]),
            ),
          ),
        })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSessionExercises([]);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-extrabold text-black">
        Workout time?
      </h2>

      {sessionExercises.map((exercise) => (
        <div
          key={exercise.key}
          className="flex flex-col gap-2 rounded-xl border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold">
              {exercise.exerciseName}
            </span>
            <button
              type="button"
              onClick={() => removeExercise(exercise.key)}
              className="text-gray-400 hover:text-red-600"
            >
              ×
            </button>
          </div>

          <p className="text-xs text-gray-500">
            {exercise.dimensions
              .map((dim) => `${dim}: ${exercise.plannedTargets[dim] ?? '—'}`)
              .join('  ·  ')}
          </p>

          <div className="flex flex-col gap-2">
            {exercise.sets.map((set, idx) => (
              <div key={set.key} className="flex flex-wrap items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-gray-400">
                  Set {idx + 1}
                </span>
                {exercise.dimensions.map((dim) => (
                  <label key={dim} className="flex items-center gap-1 text-xs">
                    <span className="capitalize text-gray-500">{dim}</span>
                    <input
                      type="number"
                      step="any"
                      placeholder={exercise.plannedTargets[dim] ?? ''}
                      value={set.actuals[dim] ?? ''}
                      onChange={(e) =>
                        updateActual(exercise.key, set.key, dim, e.target.value)
                      }
                      className="w-16 rounded border px-1 py-0.5"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => duplicateSet(exercise.key, set.key)}
                  className="ml-auto text-xs text-gray-400 hover:text-black"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => deleteSet(exercise.key, set.key)}
                  disabled={exercise.sets.length <= 1}
                  className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-30"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sessionExercises.length > 0 && (
        <button
          type="button"
          onClick={handleSaveSession}
          disabled={saving}
          className="font-heading w-full rounded-xl bg-[#c8ff57] py-3 text-sm font-semibold text-[#111111] disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Session'}
        </button>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setIsSelectWorkoutOpen(true)}
          className="font-heading rounded-xl border border-[#111111] px-5 py-2.5 text-sm font-semibold text-[#111111] hover:bg-gray-50"
        >
          Select Workout
        </button>
        <button
          type="button"
          onClick={() => setIsAddExerciseOpen(true)}
          className="font-heading rounded-xl border border-[#111111] px-5 py-2.5 text-sm font-semibold text-[#111111] hover:bg-gray-50"
        >
          Add Exercise
        </button>
      </div>

      {isSelectWorkoutOpen && (
        <SelectWorkoutModal
          templates={fullTemplates}
          onConfirm={(exercises) => {
            addExercises(exercises);
            setIsSelectWorkoutOpen(false);
          }}
          onClose={() => setIsSelectWorkoutOpen(false)}
        />
      )}

      {isAddExerciseOpen && (
        <AddExerciseModal
          exercises={exercises}
          onAdd={(exercise) => {
            addExercise(exercise);
            setIsAddExerciseOpen(false);
          }}
          onClose={() => setIsAddExerciseOpen(false)}
        />
      )}
    </div>
  );
}
