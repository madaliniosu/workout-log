import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getPersonalRecords, getVolumeOverTime, getExerciseNamesWithData, getPlannedVsActual } from '@/db/queries/analytics';
import { getWorkoutHistoryForUser } from '@/db/queries/scheduled-workouts';
import { ProgressTabs } from './progress-tabs';

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [volumeData, personalRecords, exerciseNames, plannedVsActual, workoutHistory] = await Promise.all([
    getVolumeOverTime(session.user.id),
    getPersonalRecords(session.user.id),
    getExerciseNamesWithData(session.user.id),
    getPlannedVsActual(session.user.id),
    getWorkoutHistoryForUser(session.user.id),
  ]);

  const chartData = volumeData.map((v) => ({
    date: new Date(v.date!).toLocaleDateString(), // completedAt is always set: this row only exists if completedSets was written, and that always sets completedAt in the same batch
    volume: v.volume,
  }));

  return (
    <ProgressTabs
      chartData={chartData}
      personalRecords={personalRecords}
      exerciseNames={exerciseNames}
      plannedVsActual={plannedVsActual}
      workoutHistory={workoutHistory}
    />
  );
}
