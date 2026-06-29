'use client';

import { useState } from 'react';
import { TrendsTab } from './trends-tab';
import { HistoryTab } from './history-tab';

type ChartPoint = { date: string; volume: number };
type PersonalRecord = { exerciseName: string; maxWeight: number };
type PlannedVsActualRow = { exerciseName: string; dimension: string; avgPlanned: number; avgActual: number };
type CompletedSet = { setNumber: number; dimension: string; value: number };
type Target = { dimension: string; targetValue: number };
type WorkoutExercise = {
  id: string;
  exerciseName: string;
  setCount: number;
  targets: Target[];
  completedSets: CompletedSet[];
};
type Workout = { id: string; name: string; completedAt: Date | null; exercises: WorkoutExercise[] };

export function ProgressTabs({
  chartData,
  personalRecords,
  exerciseNames,
  plannedVsActual,
  workoutHistory,
}: {
  chartData: ChartPoint[];
  personalRecords: PersonalRecord[];
  exerciseNames: string[];
  plannedVsActual: PlannedVsActualRow[];
  workoutHistory: Workout[];
}) {
  const [activeTab, setActiveTab] = useState<'trends' | 'history'>('trends');

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-10 pt-10">
        <h1 className="font-heading text-[32px] font-extrabold text-black">Progress</h1>
      </div>

      <div className="flex gap-3 px-10 pt-6">
        <button
          type="button"
          onClick={() => setActiveTab('trends')}
          className={`font-heading rounded-full px-5 py-2.5 text-sm font-semibold ${
            activeTab === 'trends' ? 'bg-[#111111] text-white' : 'border border-[#e5e5e5] bg-white text-[#666]'
          }`}
        >
          Trends
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`font-heading rounded-full px-5 py-2.5 text-sm font-semibold ${
            activeTab === 'history' ? 'bg-[#111111] text-white' : 'border border-[#e5e5e5] bg-white text-[#666]'
          }`}
        >
          History
        </button>
      </div>

      <div className="p-10">
        {activeTab === 'trends' ? (
          <TrendsTab
            chartData={chartData}
            personalRecords={personalRecords}
            exerciseNames={exerciseNames}
            plannedVsActual={plannedVsActual}
          />
        ) : (
          <HistoryTab workouts={workoutHistory} />
        )}
      </div>
    </div>
  );
}
