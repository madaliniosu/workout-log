import { VolumeChart } from './volume-chart';
import { ExerciseProgress } from './exercise-progress';

type ChartPoint = { date: string; volume: number };
type PersonalRecord = { exerciseName: string; maxWeight: number };
type PlannedVsActualRow = { exerciseName: string; dimension: string; avgPlanned: number; avgActual: number };

export function TrendsTab({
  chartData,
  personalRecords,
  exerciseNames,
  plannedVsActual,
}: {
  chartData: ChartPoint[];
  personalRecords: PersonalRecord[];
  exerciseNames: string[];
  plannedVsActual: PlannedVsActualRow[];
}) {
  return (
    <div>
      <h2 className="font-medium mb-2">Training volume over time</h2>
      {chartData.length > 0 ? (
        <VolumeChart data={chartData} />
      ) : (
        <p className="text-gray-500 text-sm mb-6">Log a few workouts to see your volume trend.</p>
      )}

      <h2 className="font-medium mt-8 mb-2">Personal records</h2>
      <table className="w-full text-sm">
        <tbody>
          {personalRecords.map((pr) => (
            <tr key={pr.exerciseName} className="border-b">
              <td className="py-1">{pr.exerciseName}</td>
              <td className="py-1 text-right">{pr.maxWeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {personalRecords.length === 0 && <p className="text-gray-500 text-sm">No personal records yet.</p>}

      <h2 className="font-medium mt-8 mb-2">Progress by exercise</h2>
      <ExerciseProgress exerciseNames={exerciseNames} />

      <h2 className="font-medium mt-8 mb-2">Planned vs. actual</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-1">Exercise</th>
            <th className="py-1">Dimension</th>
            <th className="py-1 text-right">Planned (avg)</th>
            <th className="py-1 text-right">Actual (avg)</th>
          </tr>
        </thead>
        <tbody>
          {plannedVsActual.map((row) => (
            <tr key={`${row.exerciseName}-${row.dimension}`} className="border-b">
              <td className="py-1">{row.exerciseName}</td>
              <td className="py-1">{row.dimension}</td>
              <td className="py-1 text-right">{row.avgPlanned.toFixed(1)}</td>
              <td className="py-1 text-right">{row.avgActual.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {plannedVsActual.length === 0 && <p className="text-gray-500 text-sm">No planned-vs-actual data yet.</p>}
    </div>
  );
}
