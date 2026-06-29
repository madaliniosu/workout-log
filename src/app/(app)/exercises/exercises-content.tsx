'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/validations';
import { AddExerciseButton } from './add-exercise-button';
import { DeleteExerciseButton } from './delete-exercise-button';
import { EditExerciseButton } from './edit-exercise-button';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string | null;
  category: string;
  dimensions: string[];
  userId: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  Strength: '#c8ff57',
  Cardio: '#ff8a65',
  Mobility: '#a78bfa',
  HIIT: '#4f70fa',
};

export function ExercisesContent({
  exercises,
  userId,
}: {
  exercises: Exercise[];
  userId: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exercises.filter((exercise) => {
    const matchesCategory =
      !selectedCategory || exercise.category === selectedCategory;
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-10 pt-10">
        <h1 className="font-heading text-[32px] font-extrabold text-black">
          Exercises Library
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-[400px] items-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4">
            <Search size={20} strokeWidth={2} color="#666666" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full text-base text-[#111111] placeholder:text-[#666] focus:outline-none"
            />
          </div>
          <AddExerciseButton />
        </div>
      </div>

      <div className="flex gap-3 px-10 pt-6">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`font-heading rounded-full px-5 py-2.5 text-sm font-semibold ${
            selectedCategory === null
              ? 'bg-[#111111] text-white'
              : 'border border-[#e5e5e5] bg-white text-[#666]'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`font-heading rounded-full px-5 py-2.5 text-sm font-semibold ${
              selectedCategory === category
                ? 'bg-[#111111] text-white'
                : 'border border-[#e5e5e5] bg-white text-[#666]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 p-10">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="relative w-[270px] overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white"
          >
            <div
              className="h-2 w-full"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[exercise.category] ?? '#c8ff57',
              }}
            />
            <div className="flex flex-col gap-2 p-5">
              <div className="flex gap-1.5">
                <span className="font-heading rounded bg-[#e7ffb5] px-2 py-0.5 text-[10px] font-semibold uppercase text-black">
                  {exercise.category}
                </span>
                {exercise.muscleGroup && (
                  <span className="font-heading rounded bg-[#f9f9f9] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#666]">
                    {exercise.muscleGroup}
                  </span>
                )}
              </div>
              <p className="font-heading text-lg font-semibold text-black">
                {exercise.name}
              </p>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {exercise.userId === userId && (
                <EditExerciseButton exercise={exercise} />
              )}
              <DeleteExerciseButton exerciseId={exercise.id} />
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <p className="px-10 text-sm text-gray-500">
          {exercises.length === 0
            ? 'No exercises yet — add your first one above.'
            : 'No exercises match your search.'}
        </p>
      )}
    </div>
  );
}
