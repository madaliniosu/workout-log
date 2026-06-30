'use client';

import { useState } from 'react';
import { DIMENSIONS, CATEGORIES } from '@/lib/validations';
import { SessionExercise } from './workout-session-section';

type ExerciseOption = { id: string; name: string; dimensions: string[] };

const CREATE_VALUE = '__create__';

export function AddExerciseModal({
  exercises,
  onAdd,
  onClose,
}: {
  exercises: ExerciseOption[];
  onAdd: (exercise: SessionExercise) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [plannedTargets, setPlannedTargets] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [checkedDims, setCheckedDims] = useState<Record<string, boolean>>({});
  const [newPlanned, setNewPlanned] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const filteredExercises = query
    ? exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : exercises;

  const selectedExercise =
    selectedId && selectedId !== CREATE_VALUE
      ? (exercises.find((e) => e.id === selectedId) ?? null)
      : null;

  function handleSelectChange(value: string) {
    setSelectedId(value);
    setPlannedTargets({});
  }

  const canConfirm =
    selectedId === CREATE_VALUE
      ? !!newName.trim() && !!newCategory && DIMENSIONS.some((d) => checkedDims[d])
      : !!selectedExercise;

  async function handleConfirm() {
    if (!canConfirm) return;

    if (selectedId === CREATE_VALUE) {
      const checkedDimensions = DIMENSIONS.filter((d) => checkedDims[d]);
      setCreating(true);
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), category: newCategory, dimensions: checkedDimensions }),
      });
      setCreating(false);
      if (!res.ok) return;
      const { id } = await res.json();
      onAdd({
        key: crypto.randomUUID(),
        exerciseId: id,
        exerciseName: newName.trim(),
        dimensions: checkedDimensions,
        plannedTargets: Object.fromEntries(checkedDimensions.map((d) => [d, newPlanned[d] ?? ''])),
        sets: [{ key: crypto.randomUUID(), actuals: {} }],
      });
    } else if (selectedExercise) {
      onAdd({
        key: crypto.randomUUID(),
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        dimensions: selectedExercise.dimensions,
        plannedTargets,
        sets: [{ key: crypto.randomUUID(), actuals: {} }],
      });
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold">Add Exercise</h3>

        <input
          type="text"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg p-2 text-sm"
        />

        <select
          value={selectedId}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="">Select an exercise...</option>
          {filteredExercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
          <option value={CREATE_VALUE}>➕ Create New Exercise</option>
        </select>

        {selectedExercise && (
          <div className="flex flex-col gap-2 rounded-lg border p-3">
            <span className="font-medium text-sm">{selectedExercise.name}</span>
            <div className="flex flex-wrap gap-3">
              {selectedExercise.dimensions.map((dim) => (
                <label key={dim} className="flex items-center gap-1 text-xs">
                  <span className="capitalize text-gray-500">{dim}</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="planned"
                    value={plannedTargets[dim] ?? ''}
                    onChange={(e) =>
                      setPlannedTargets((prev) => ({ ...prev, [dim]: e.target.value }))
                    }
                    className="w-20 rounded border px-2 py-1"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {selectedId === CREATE_VALUE && (
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <input
              type="text"
              placeholder="Exercise name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex flex-col gap-2">
              {DIMENSIONS.map((dim) => (
                <div key={dim} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`dim-${dim}`}
                    checked={checkedDims[dim] ?? false}
                    onChange={(e) =>
                      setCheckedDims((prev) => ({ ...prev, [dim]: e.target.checked }))
                    }
                  />
                  <label htmlFor={`dim-${dim}`} className="w-16 text-xs capitalize">
                    {dim}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="planned"
                    disabled={!checkedDims[dim]}
                    value={newPlanned[dim] ?? ''}
                    onChange={(e) =>
                      setNewPlanned((prev) => ({ ...prev, [dim]: e.target.value }))
                    }
                    className="w-20 rounded border px-2 py-1 text-xs disabled:bg-gray-50 disabled:opacity-40"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || creating}
            className="font-heading flex-1 rounded-xl bg-[#c8ff57] py-2.5 text-sm font-semibold text-[#111111] disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Add to Workout'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-heading rounded-xl border px-4 py-2.5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
