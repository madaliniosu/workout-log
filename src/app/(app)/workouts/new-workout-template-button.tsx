'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Exercise = { id: string; name: string; dimensions: string[] };
type Row = { exerciseId: string; setCount: string; targets: Record<string, string> };

const emptyRow: Row = { exerciseId: '', setCount: '', targets: {} };

export function NewWorkoutTemplateButton({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateRow(index: number, field: 'exerciseId' | 'setCount', value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function updateTarget(index: number, dimension: string, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, targets: { ...row.targets, [dimension]: value } } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setName('');
    setNotes('');
    setRows([{ ...emptyRow }]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch('/api/workout-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        notes: notes || undefined,
        exercises: rows.map((row) => {
          const exercise = exercises.find((e) => e.id === row.exerciseId);
          const dimensions = exercise?.dimensions ?? [];
          return {
            exerciseId: row.exerciseId,
            setCount: row.setCount,
            targets: dimensions.map((dimension) => ({
              dimension,
              targetValue: row.targets[dimension] ?? '',
            })),
          };
        }),
      }),
    });

    setPending(false);

    if (!res.ok) {
      setError('Something went wrong saving the workout');
      return;
    }

    reset();
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-black text-white rounded p-2 text-sm">
        + New workout
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white text-gray-500 rounded p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-medium mb-3">New workout</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                placeholder="Workout name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border rounded p-2"
              />
              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border rounded p-2"
              />

              {rows.map((row, index) => {
                const selectedExercise = exercises.find((e) => e.id === row.exerciseId);
                return (
                  <div key={index} className="flex flex-col gap-2 border-b pb-2">
                    <div className="flex gap-2 items-center">
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
                      <input
                        type="number"
                        placeholder="Sets"
                        value={row.setCount}
                        onChange={(e) => updateRow(index, 'setCount', e.target.value)}
                        required
                        min={1}
                        className="border rounded p-2 w-20"
                      />
                      {rows.length > 1 && (
                        <button type="button" onClick={() => removeRow(index)} className="text-red-600 text-sm">
                          Remove
                        </button>
                      )}
                    </div>

                    {selectedExercise && selectedExercise.dimensions.length > 0 && (
                      <div className="flex gap-2 flex-wrap pl-1">
                        {selectedExercise.dimensions.map((dimension) => (
                          <label key={dimension} className="text-xs flex items-center gap-1">
                            {dimension}
                            <input
                              type="number"
                              step="any"
                              placeholder="target"
                              value={row.targets[dimension] ?? ''}
                              onChange={(e) => updateTarget(index, dimension, e.target.value)}
                              required
                              className="border rounded p-1 w-20"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <button type="button" onClick={addRow} className="text-sm text-left underline">
                + Add exercise
              </button>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
                {pending ? 'Saving...' : 'Save workout'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
