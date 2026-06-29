'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { WorkoutTemplateForm } from './workout-template-form';

type Exercise = { id: string; name: string; dimensions: string[] };

export function NewWorkoutTemplateButton({ exercises }: { exercises: Exercise[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-heading flex items-center gap-2 rounded-xl bg-[#c8ff57] px-6 py-3 text-sm font-semibold text-[#111111]"
      >
        <Plus size={18} strokeWidth={2} />
        New Workout
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
            <h2 className="font-heading text-2xl font-extrabold text-[#111111] mb-6">New Workout</h2>
            <WorkoutTemplateForm exercises={exercises} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
