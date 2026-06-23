import { db } from '@/db';
import { workoutSessions, workoutSets } from '@/db/schema';

type SetInput = {
  exerciseId: string;
  setOrder: number;
  reps: number;
  weight: number;
  rpe?: number;
};

export async function createWorkoutSession(
  userId: string,
  data: { date: Date; notes?: string; sets: SetInput[] }
) {
  const sessionId = crypto.randomUUID();

  await db.batch([
    db.insert(workoutSessions).values({
      id: sessionId,
      userId,
      date: data.date,
      notes: data.notes,
    }),
    db.insert(workoutSets).values(data.sets.map((set) => ({ ...set, sessionId }))),
  ]);

  return sessionId;
}
