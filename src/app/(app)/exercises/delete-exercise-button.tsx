'use client';

import { useRouter } from 'next/navigation';

export function DeleteExerciseButton({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this exercise?')) return;

    const res = await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleDelete} className="text-red-600 text-sm">
      Delete
    </button>
  );
}
