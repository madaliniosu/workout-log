'use client';

import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Exercise = { id: string; name: string };
type DataPoint = { date: string; maxWeight: number };

export function ExerciseProgress({ exercises }: { exercises: Exercise[] }) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? '');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseId) return;

    fetch(`/api/analytics/exercise-progress?exerciseId=${exerciseId}`)
      .then((res) => res.json())
      .then((rows: { date: string; maxWeight: number }[]) => {
        setData(rows.map((r) => ({ date: new Date(r.date).toLocaleDateString(), maxWeight: r.maxWeight })));
      })
      .finally(() => setLoading(false));
  }, [exerciseId]);

  function handleExerciseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    setExerciseId(e.target.value);
  }

  return (
    <div>
      <select value={exerciseId} onChange={handleExerciseChange} className="border rounded p-2 mb-2">
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {!loading && data.length === 0 && <p className="text-gray-500 text-sm">No data for this exercise yet.</p>}
      {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="maxWeight" stroke="#000" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
