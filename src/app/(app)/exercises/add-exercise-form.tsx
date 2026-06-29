'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MUSCLE_GROUPS, CATEGORIES, DIMENSIONS } from '@/lib/validations';

const dimensionLabels: Record<string, string> = {
  reps: 'Reps',
  time: 'Time',
  weight: 'Weight',
  distance: 'Distance',
};

export function AddExerciseForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dimensions, setDimensions] = useState<string[]>([]);

  function toggleDimension(dimension: string) {
    setDimensions((prev) =>
      prev.includes(dimension) ? prev.filter((d) => d !== dimension) : [...prev, dimension]
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-heading text-sm font-semibold text-[#111111]">
          Exercise Name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Bench Press"
          required
          className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="category" className="font-heading text-sm font-semibold text-[#111111]">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue=""
            required
            className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
          >
            <option value="" disabled>
              Select category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="muscleGroup" className="font-heading text-sm font-semibold text-[#111111]">
            Muscle Group
          </label>
          <select
            id="muscleGroup"
            name="muscleGroup"
            defaultValue=""
            className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
          >
            <option value="">Optional</option>
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-heading text-sm font-semibold text-[#111111]">Tracks</span>
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map((dimension) => {
            const isSelected = dimensions.includes(dimension);
            return (
              <button
                key={dimension}
                type="button"
                onClick={() => toggleDimension(dimension)}
                className={`font-heading rounded-full border px-4 py-2 text-sm font-semibold ${
                  isSelected ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#e5e5e5] bg-white text-[#666]'
                }`}
              >
                {dimensionLabels[dimension]}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="font-heading h-[60px] rounded-2xl bg-[#c8ff57] text-lg font-semibold text-[#111111] disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add Exercise'}
      </button>
    </form>
  );
}
