'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MUSCLE_GROUPS, DIMENSIONS, CATEGORIES } from '@/lib/validations';

const dimensionLabels: Record<string, string> = {
  reps: 'Reps',
  time: 'Time',
  weight: 'Weight',
  rpe: 'RPE',
  distance: 'Distance',
};

export function AddExerciseForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dimensions, setDimensions] = useState<string[]>([]);

  function toggleDimension(dimension: string) {
    setDimensions((prev) =>
      prev.includes(dimension)
        ? prev.filter((d) => d !== dimension)
        : [...prev, dimension],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (dimensions.length === 0) {
      setError('Select at least one dimension');
      return;
    }

    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        muscleGroup: formData.get('muscleGroup') || undefined,
        category: formData.get('category'),
        dimensions,
      }),
    });

    setPending(false);

    if (!res.ok) {
      setError('Something went wrong');
      return;
    }

    router.refresh();
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="name"
        placeholder="Exercise name"
        required
        className="border rounded p-2"
      />

      <select name="muscleGroup" defaultValue="" className="border rounded p-2">
        <option value="">Muscle group (optional)</option>
        {MUSCLE_GROUPS.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      <select
        name="category"
        defaultValue=""
        required
        className="border rounded p-2"
      >
        <option value="" disabled>
          Category
        </option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium mb-1">Tracks</legend>
        {DIMENSIONS.map((dimension) => (
          <label key={dimension} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dimensions.includes(dimension)}
              onChange={() => toggleDimension(dimension)}
            />
            {dimensionLabels[dimension]}
          </label>
        ))}
      </fieldset>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded p-2 disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add exercise'}
      </button>
    </form>
  );
}
