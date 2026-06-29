'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

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
    <button type="button" onClick={handleDelete} aria-label="Delete exercise" className="text-gray-300 hover:text-red-500">
      <Trash2 size={16} strokeWidth={2} />
    </button>
  );
}
