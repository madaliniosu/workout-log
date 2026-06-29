'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { AddExerciseForm } from './add-exercise-form';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
  category: string;
  dimensions: string[];
};

export function EditExerciseButton({ exercise }: { exercise: Exercise }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Edit exercise"
        className="text-gray-300 hover:text-[#111111]"
      >
       <Pencil size={16} strokeWidth={2} />
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
            <h2 className="font-heading text-2xl font-extrabold text-[#111111] mb-6">Edit Exercise</h2>
            <AddExerciseForm exercise={exercise} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
