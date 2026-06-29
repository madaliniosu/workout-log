'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="bg-white text-gray-500 rounded p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-medium mb-3">Add a custom exercise</h2>
            <AddExerciseForm onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
