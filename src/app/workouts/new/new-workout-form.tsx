'use client';

import { useState } from 'react';

type Exercise = { id: string; name: string };
type SetRow = { exerciseId: string; reps: string; weight: string; rpe: string };

const emptyRow: SetRow = { exerciseId: '', reps: '', weight: '', rpe: '' };

export function NewWorkoutForm({ exercises }: { exercises: Exercise[] }) {
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<SetRow[]>([{ ...emptyRow }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function updateRow(index: number, field: keyof SetRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString(),
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
      setError('Something went wrong saving the workout');
      return;
    }

    setNotes('');
    setRows([{ ...emptyRow }]);
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border rounded p-2"
      />

      {rows.map((row, index) => (
        <div key={index} className="flex gap-2 items-center">
          <select
            value={row.exerciseId}
            onChange={(e) => updateRow(index, 'exerciseId', e.target.value)}
            required
            className="border rounded p-2 flex-1"
          >
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
      {success && <p className="text-green-600 text-sm">Workout saved!</p>}

      <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
        {pending ? 'Saving...' : 'Save workout'}
      </button>
    </form>
  );
}
