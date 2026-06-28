'use client';

import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type DataPoint = { date: string; maxWeight: number };

export function ExerciseProgress({ exerciseNames }: { exerciseNames: string[] }) {
  const [exerciseName, setExerciseName] = useState(exerciseNames[0] ?? '');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseName) return;

    fetch(`/api/analytics/exercise-progress?exerciseName=${encodeURIComponent(exerciseName)}`)
      .then((res) => res.json())
      .then((rows: { date: string; maxWeight: number }[]) => {
        setData(rows.map((r) => ({ date: new Date(r.date).toLocaleDateString(), maxWeight: r.maxWeight })));
      })
      .finally(() => setLoading(false));
  }, [exerciseName]);

  function handleExerciseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    setExerciseName(e.target.value);
  }

  return (
    <div>
      <select value={exerciseName} onChange={handleExerciseChange} className="border rounded p-2 mb-2">
        {exerciseNames.map((name) => (
          <option key={name} value={name}>
            {name}
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
