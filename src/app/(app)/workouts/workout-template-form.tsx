'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Exercise = { id: string; name: string; dimensions: string[] };
type Row = { exerciseId: string; setCount: string; targets: Record<string, string> };

type ExistingTemplate = {
  id: string;
  name: string;
  notes: string | null;
  exercises: { exerciseId: string | null; setCount: number; targets: { dimension: string; targetValue: number }[] }[];
};

const emptyRow: Row = { exerciseId: '', setCount: '', targets: {} };

function rowsFromTemplate(template?: ExistingTemplate): Row[] {
  if (!template || template.exercises.length === 0) {
    return [{ ...emptyRow }];
  }
  return template.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId ?? '',
    setCount: String(exercise.setCount),
    targets: Object.fromEntries(exercise.targets.map((t) => [t.dimension, String(t.targetValue)])),
  }));
}

export function WorkoutTemplateForm({
  template,
  exercises,
  onSuccess,
}: {
  template?: ExistingTemplate;
  exercises: Exercise[];
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(template?.name ?? '');
  const [notes, setNotes] = useState(template?.notes ?? '');
  const [rows, setRows] = useState<Row[]>(rowsFromTemplate(template));
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(template ? `/api/workout-templates/${template.id}` : '/api/workout-templates', {
      method: template ? 'PATCH' : 'POST',
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

    router.refresh();
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm font-semibold text-[#111111]">Workout Name</label>
        <input
          placeholder="Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-heading text-sm font-semibold text-[#111111]">Notes</label>
        <textarea
          placeholder="Optional"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border border-[#e5e5e5] p-4 text-base text-[#111111] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
        />
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const selectedExercise = exercises.find((e) => e.id === row.exerciseId);
          return (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] p-4">
              <div className="flex gap-2 items-center">
                <select
                  value={row.exerciseId}
                  onChange={(e) => updateRow(index, 'exerciseId', e.target.value)}
                  required
                  className="h-12 flex-1 rounded-xl border border-[#e5e5e5] px-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
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
                  className="h-12 w-20 rounded-xl border border-[#e5e5e5] px-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
                />
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeRow(index)} className="text-sm text-red-500">
                    Remove
                  </button>
                )}
              </div>

              {selectedExercise && selectedExercise.dimensions.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedExercise.dimensions.map((dimension) => (
                    <label key={dimension} className="flex items-center gap-1 text-xs text-[#666]">
                      {dimension}
                      <input
                        type="number"
                        step="any"
                        placeholder="target"
                        value={row.targets[dimension] ?? ''}
                        onChange={(e) => updateTarget(index, dimension, e.target.value)}
                        required
                        className="h-8 w-20 rounded-lg border border-[#e5e5e5] px-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="font-heading text-left text-sm font-semibold text-[#111111] underline"
      >
        + Add exercise
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="font-heading h-[60px] rounded-2xl bg-[#c8ff57] text-lg font-semibold text-[#111111] disabled:opacity-50"
      >
        {pending ? 'Saving...' : template ? 'Save Changes' : 'Save Workout'}
      </button>
    </form>
  );
}
