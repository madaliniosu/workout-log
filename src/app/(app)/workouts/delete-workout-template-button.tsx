'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/confirm-dialog';

export function DeleteWorkoutTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleDelete() {
    setIsConfirming(false);
    const res = await fetch(`/api/workout-templates/${templateId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <>
      <button type="button" onClick={() => setIsConfirming(true)} className="text-red-600 text-sm">
        Delete
      </button>

      <ConfirmDialog
        open={isConfirming}
        title="Delete workout?"
        message="This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
