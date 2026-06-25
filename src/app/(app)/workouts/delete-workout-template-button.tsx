'use client';

import { useRouter } from 'next/navigation';

export function DeleteWorkoutTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this workout?')) return;

    const res = await fetch(`/api/workout-templates/${templateId}`, { method: 'DELETE' });
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
