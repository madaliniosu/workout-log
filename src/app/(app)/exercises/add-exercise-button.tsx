'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AddExerciseForm } from './add-exercise-form';

export function AddExerciseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-heading flex items-center gap-2 rounded-xl bg-[#c8ff57] px-6 py-3 text-sm font-semibold text-[#111111]"
      >
        <Plus size={18} strokeWidth={2} />
        Add Exercise
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="absolute top-6 right-6 text-gray-400 hover:text-[#111111]"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <h2 className="font-heading text-2xl font-extrabold text-[#111111] mb-6">Add Exercise</h2>
            <AddExerciseForm onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
