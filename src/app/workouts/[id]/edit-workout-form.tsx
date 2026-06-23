'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Exercise = { id: string; name: string };
type SetRow = { exerciseId: string; reps: string; weight: string; rpe: string };
type Workout = {
  id: string;
  date: string | Date;
  notes: string | null;
  sets: { exerciseId: string; reps: number; weight: number; rpe: number | null }[];
};

export function EditWorkoutForm({ workout, exercises }: { workout: Workout; exercises: Exercise[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(workout.notes ?? '');
  const [rows, setRows] = useState<SetRow[]>(
    workout.sets.map((s) => ({
      exerciseId: s.exerciseId,
      reps: String(s.reps),
      weight: String(s.weight),
      rpe: s.rpe ? String(s.rpe) : '',
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateRow(index: number, field: keyof SetRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { exerciseId: '', reps: '', weight: '', rpe: '' }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(`/api/workouts/${workout.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date(workout.date).toISOString(),
        notes: notes || undefined,
        sets: rows.map((row) => ({
          exerciseId: row.exerciseId,
          reps: row.reps,
          weight: row.weight,
          rpe: row.rpe || undefined,
        })),
      }),
    });

    setPending(false);

    if (!res.ok) {
      setError('Something went wrong saving changes');
      return;
    }

    router.push('/workouts');
  }

  async function handleDelete() {
    if (!confirm('Delete this workout?')) return;

    const res = await fetch(`/api/workouts/${workout.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/workouts');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="border rounded p-2" />

      {rows.map((row, index) => (
        <div key={index} className="flex gap-2 items-center">
          <select value={row.exerciseId} onChange={(e) => updateRow(index, 'exerciseId', e.target.value)} required className="border rounded p-2 flex-1">
            <option value="">Select exercise</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <input type="number" placeholder="Reps" value={row.reps} onChange={(e) => updateRow(index, 'reps', e.target.value)} required className="border rounded p-2 w-20" />
          <input type="number" placeholder="Weight" value={row.weight} onChange={(e) => updateRow(index, 'weight', e.target.value)} required className="border rounded p-2 w-24" />
          <input type="number" placeholder="RPE" value={row.rpe} onChange={(e) => updateRow(index, 'rpe', e.target.value)} className="border rounded p-2 w-16" />
          {rows.length > 1 && (
            <button type="button" onClick={() => removeRow(index)} className="text-red-600 text-sm">
              Remove
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addRow} className="text-sm text-left underline">
        + Add set
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
          {pending ? 'Saving...' : 'Save changes'}
        </button>
        <button type="button" onClick={handleDelete} className="text-red-600 text-sm">
          Delete workout
        </button>
      </div>
    </form>
  );
}
