'use client';

import { useState } from 'react';
import { SessionExercise } from './workout-session-section';

type Target = { dimension: string; targetValue: number };
type TemplateExercise = {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  setCount: number;
  targets: Target[];
};
type FullTemplate = { id: string; name: string; exercises: TemplateExercise[] };

type ExerciseConfig = {
  templateExerciseId: string;
  exerciseId: string | null;
  exerciseName: string;
  dimensions: string[];
  plannedTargets: Record<string, string>;
};

function buildConfigs(exercises: TemplateExercise[]): ExerciseConfig[] {
  return exercises.map((ex) => ({
    templateExerciseId: ex.id,
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    dimensions: ex.targets.map((t) => t.dimension),
    plannedTargets: Object.fromEntries(
      ex.targets.map((t) => [t.dimension, String(t.targetValue)]),
    ),
  }));
}

export function SelectWorkoutModal({
  templates,
  onConfirm,
  onClose,
}: {
  templates: FullTemplate[];
  onConfirm: (exercises: SessionExercise[]) => void;
  onClose: () => void;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [exerciseConfigs, setExerciseConfigs] = useState<ExerciseConfig[]>([]);

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    setExerciseConfigs(template ? buildConfigs(template.exercises) : []);
  }

  function updatePlanned(
    templateExerciseId: string,
    dimension: string,
    value: string,
  ) {
    setExerciseConfigs((prev) =>
      prev.map((config) =>
        config.templateExerciseId !== templateExerciseId
          ? config
          : {
              ...config,
              plannedTargets: { ...config.plannedTargets, [dimension]: value },
            },
      ),
    );
  }

  function handleConfirm() {
    if (!selectedTemplateId || exerciseConfigs.length === 0) return;

    const sessionExercises: SessionExercise[] = exerciseConfigs.map(
      (config) => ({
        key: crypto.randomUUID(),
        exerciseId: config.exerciseId,
        exerciseName: config.exerciseName,
        dimensions: config.dimensions,
        plannedTargets: config.plannedTargets,
        sets: [{ key: crypto.randomUUID(), actuals: {} }],
      }),
    );

    onConfirm(sessionExercises);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold">Select Workout</h3>

        <select
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="">Choose a workout...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {exerciseConfigs.map((config) => (
          <div
            key={config.templateExerciseId}
            className="flex flex-col gap-2 rounded-lg border p-3"
          >
            <span className="font-medium text-sm">{config.exerciseName}</span>
            <div className="flex flex-wrap gap-3">
              {config.dimensions.map((dim) => (
                <label key={dim} className="flex items-center gap-1 text-xs">
                  <span className="capitalize text-gray-500">{dim}</span>
                  <input
                    type="number"
                    step="any"
                    value={config.plannedTargets[dim] ?? ''}
                    onChange={(e) =>
                      updatePlanned(
                        config.templateExerciseId,
                        dim,
                        e.target.value,
                      )
                    }
                    className="w-20 rounded border px-2 py-1"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTemplateId || exerciseConfigs.length === 0}
            className="font-heading flex-1 rounded-xl bg-[#c8ff57] py-2.5 text-sm font-semibold text-[#111111] disabled:opacity-40"
          >
            Start Workout
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-heading rounded-xl border px-4 py-2.5 text-sm font-semibold text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
