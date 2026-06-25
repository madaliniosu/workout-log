'use client';

import { useState } from 'react';
import { AddExerciseForm } from './add-exercise-form';

export function AddExerciseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-black text-white rounded p-2 text-sm">
        + Add exercise
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
