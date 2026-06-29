'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';

export function DeleteExerciseButton({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleDelete() {
    setIsConfirming(false);
    const res = await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label="Delete exercise"
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>

      <ConfirmDialog
        open={isConfirming}
        title="Delete exercise?"
        message="This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
