import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getPersonalRecords, getVolumeOverTime } from '@/db/queries/analytics';
import { getExercisesForUser } from '@/db/queries/exercises';
import { VolumeChart } from './volume-chart';
import { ExerciseProgress } from './exercise-progress';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [volumeData, personalRecords, exercises] = await Promise.all([
    getVolumeOverTime(session.user.id),
    getPersonalRecords(session.user.id),
    getExercisesForUser(session.user.id),
  ]);

  const chartData = volumeData.map((v) => ({
    date: new Date(v.date).toLocaleDateString(),
    volume: v.volume,
  }));

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <h1 className="text-xl font-semibold mb-6">Analytics</h1>

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
            <tr key={pr.exerciseId} className="border-b">
              <td className="py-1">{pr.exerciseName}</td>
              <td className="py-1 text-right">{pr.maxWeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {personalRecords.length === 0 && <p className="text-gray-500 text-sm">No personal records yet.</p>}

      <h2 className="font-medium mt-8 mb-2">Progress by exercise</h2>
      <ExerciseProgress exercises={exercises} />
    </div>
  );
}
