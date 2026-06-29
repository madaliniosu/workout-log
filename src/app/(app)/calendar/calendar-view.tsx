'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/confirm-dialog';

type ScheduledWorkout = {
  id: string;
  name: string;
  scheduledAt: string;
  completed: boolean;
};
type Template = { id: string; name: string };

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthGrid(monthDate: Date) {
  const startWeekday = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1,
  ).getDay();
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();

  const days: Date[] = [];
  for (let i = 0; i < startWeekday; i++) {
    days.push(
      new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        i - startWeekday + 1,
      ),
    );
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
    );
  }
  return days;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarView({
  scheduledWorkouts,
  templates,
}: {
  scheduledWorkouts: ScheduledWorkout[];
  templates: Template[];
}) {
  const router = useRouter();
  const [monthDate, setMonthDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const days = getMonthGrid(monthDate);

  function workoutsForDay(dayKey: string) {
    return scheduledWorkouts.filter((w) => w.scheduledAt.startsWith(dayKey));
  }

  function workoutForHour(dayKey: string, hour: number) {
    const hourKey = `${dayKey}T${String(hour).padStart(2, '0')}:00`;
    return scheduledWorkouts.find((w) => w.scheduledAt === hourKey);
  }

  async function handleSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDayKey || selectedHour === null || !templateId) return;

    setPending(true);
    const scheduledAt = `${selectedDayKey}T${String(selectedHour).padStart(2, '0')}:00`;
    const res = await fetch('/api/scheduled-workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, scheduledAt }),
    });
    setPending(false);

    if (res.ok) {
      setSelectedHour(null);
      setTemplateId('');
      router.refresh();
    }
  }

  async function handleUnschedule(id: string) {
    const res = await fetch(`/api/scheduled-workouts/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              setMonthDate(
                (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
              )
            }
            className="text-sm underline"
          >
            ← Previous
          </button>
          <h2 className="font-medium">
            {monthDate.toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <button
            onClick={() =>
              setMonthDate(
                (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
              )
            }
            className="text-sm underline"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayKey = toDateKey(day);
            const inMonth = day.getMonth() === monthDate.getMonth();
            const dayWorkouts = workoutsForDay(dayKey);
            const allCompleted =
              dayWorkouts.length > 0 && dayWorkouts.every((w) => w.completed);
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedDayKey(dayKey);
                  setSelectedHour(null);
                }}
                className={`border rounded p-1 min-h-16 text-xs text-left ${inMonth ? '' : 'text-gray-300'} ${
                  selectedDayKey === dayKey
                    ? 'ring-2 ring-black'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-right">{day.getDate()}</div>
                {dayWorkouts.length > 0 && (
                  <div
                    className={`mt-1 text-center rounded px-1 ${allCompleted ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {dayWorkouts.length} scheduled
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-64 shrink-0 border-l pl-4">
        {!selectedDayKey && (
          <p className="text-gray-500 text-sm">
            Select a day to see its schedule.
          </p>
        )}

        {selectedDayKey && (
          <>
            <h3 className="font-medium mb-2">{selectedDayKey}</h3>
            <div className="flex flex-col gap-1 max-h-[28rem] overflow-y-auto">
              {HOURS.map((hour) => {
                const workout = workoutForHour(selectedDayKey, hour);
                const label = `${String(hour).padStart(2, '0')}:00`;
                return (
                  <div key={hour} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-gray-500">{label}</span>
                    {workout ? (
                      <div
                        className={`flex-1 flex justify-between items-center rounded px-2 py-1 ${
                          workout.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <span className="truncate">{workout.name}</span>
                        <button
                          onClick={() => setConfirmingId(workout.id)}
                          className="text-red-600 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedHour(hour)}
                        className="flex-1 text-left rounded px-2 py-1 text-gray-400 hover:bg-gray-50"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmingId !== null}
        title="Remove scheduled workout?"
        message="This can't be undone."
        onConfirm={() => {
          if (confirmingId) handleUnschedule(confirmingId);
          setConfirmingId(null);
        }}
        onCancel={() => setConfirmingId(null)}
      />

      {selectedHour !== null && selectedDayKey && (
        <div
          className="fixed inset-0 bg-black-50 flex items-center justify-center p-4"
          onClick={() => setSelectedHour(null)}
        >
          <div
            className="bg-white rounded p-4 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-medium mb-3">
              Schedule a workout — {selectedDayKey}{' '}
              {String(selectedHour).padStart(2, '0')}:00
            </h3>
            <form onSubmit={handleSchedule} className="flex flex-col gap-3">
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
              <button
                type="submit"
                disabled={pending}
                className="bg-black text-white rounded p-2 disabled:opacity-50"
              >
                {pending ? 'Scheduling...' : 'Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
