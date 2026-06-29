'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { WorkoutTemplateForm } from './workout-template-form';

type Template = {
  id: string;
  name: string;
  notes: string | null;
  exercises: { exerciseId: string | null; setCount: number; targets: { dimension: string; targetValue: number }[] }[];
};
type Exercise = { id: string; name: string; dimensions: string[] };

export function EditWorkoutTemplateButton({ template, exercises }: { template: Template; exercises: Exercise[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Edit workout"
        className="text-gray-300 hover:text-[#111111]"
      >
        <Pencil size={16} strokeWidth={2} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute top-6 right-6 text-gray-400 hover:text-[#111111]"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <h2 className="font-heading text-2xl font-extrabold text-[#111111] mb-6">Edit Workout</h2>
            <WorkoutTemplateForm template={template} exercises={exercises} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
