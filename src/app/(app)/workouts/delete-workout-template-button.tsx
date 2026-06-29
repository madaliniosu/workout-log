'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
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
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label="Delete workout"
        className="text-gray-300 hover:text-red-500"
      >
        <Trash2 size={16} strokeWidth={2} />
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
