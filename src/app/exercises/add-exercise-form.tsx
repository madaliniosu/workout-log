'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddExerciseForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        muscleGroup: formData.get('muscleGroup') || undefined,
      }),
    });

    setPending(false);

    if (!res.ok) {
      setError('Something went wrong');
      return;
    }

    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="font-medium">Add a custom exercise</h2>
      <input name="name" placeholder="Exercise name" required className="border rounded p-2" />
      <input name="muscleGroup" placeholder="Muscle group (optional)" className="border rounded p-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
        {pending ? 'Adding...' : 'Add exercise'}
      </button>
    </form>
  );
}
