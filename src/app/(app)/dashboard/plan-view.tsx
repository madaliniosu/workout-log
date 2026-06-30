'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { WorkoutSessionSection } from './workout-session-section';

type Template = { id: string; name: string };
type FullTemplate = {
  id: string;
  name: string;
  exercises: {
    id: string;
    exerciseId: string | null;
    exerciseName: string;
    setCount: number;
    targets: { dimension: string; targetValue: number }[];
  }[];
};
type ExerciseOption = { id: string; name: string; dimensions: string[] };

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function PlanView({
  templates,
  fullTemplates,
  exercises,
}: {
  templates: Template[];
  fullTemplates: FullTemplate[];
  exercises: ExerciseOption[];
}) {
  const router = useRouter();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(todayKey);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedHour === null || !templateId) return;

    setPending(true);
    const scheduledAt = `${scheduledDate}T${String(selectedHour).padStart(2, '0')}:00`;
    const res = await fetch('/api/scheduled-workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, scheduledAt }),
    });
    setPending(false);

    if (res.ok) {
      setIsScheduleOpen(false);
      setSelectedHour(null);
      setTemplateId('');
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6 p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[32px] font-extrabold text-black">Plan</h1>
        <button
          onClick={() => { setIsScheduleOpen(true); setScheduledDate(todayKey()); }}
          className="font-heading flex items-center gap-2 rounded-xl bg-[#c8ff57] px-6 py-3 text-sm font-semibold text-[#111111]"
        >
          <Plus size={18} strokeWidth={2} />
          Schedule Workout
        </button>
      </div>

      <WorkoutSessionSection exercises={exercises} fullTemplates={fullTemplates} />

      {isScheduleOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsScheduleOpen(false)}
        >
          <div className="bg-white rounded p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium mb-3">Schedule a workout</h3>
            <form onSubmit={handleSchedule} className="flex flex-col gap-3">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="border rounded p-2"
              />
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                required
                className="border rounded p-2"
              >
                <option value="">Select workout</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedHour ?? ''}
                onChange={(e) => setSelectedHour(e.target.value === '' ? null : Number(e.target.value))}
                required
                className="border rounded p-2"
              >
                <option value="">Select hour</option>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
                {pending ? 'Scheduling...' : 'Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
