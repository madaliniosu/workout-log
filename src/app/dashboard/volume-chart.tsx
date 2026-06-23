'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type DataPoint = { date: string; volume: number };

export function VolumeChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="volume" stroke="#000" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
