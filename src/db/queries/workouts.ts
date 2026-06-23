import { db } from '@/db';
import { workoutSessions, workoutSets } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { exercises } from '@/db/schema';

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

export async function getWorkoutSessionsForUser(userId: string) {
  return db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.userId, userId))
    .orderBy(desc(workoutSessions.date));
}

export async function getWorkoutSessionWithSets(sessionId: string, userId: string) {
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)));

  if (!session) {
    return null;
  }

  const sets = await db
    .select({
      id: workoutSets.id,
      exerciseId: workoutSets.exerciseId,
      exerciseName: exercises.name,
      setOrder: workoutSets.setOrder,
      reps: workoutSets.reps,
      weight: workoutSets.weight,
      rpe: workoutSets.rpe,
    })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(eq(workoutSets.sessionId, sessionId))
    .orderBy(workoutSets.setOrder);

  return { ...session, sets };
}

export async function updateWorkoutSession(
  sessionId: string,
  userId: string,
  data: { date: Date; notes?: string; sets: SetInput[] }
) {
  const [existing] = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)));

  if (!existing) {
    return false;
  }

  await db.batch([
    db.update(workoutSessions).set({ date: data.date, notes: data.notes }).where(eq(workoutSessions.id, sessionId)),
    db.delete(workoutSets).where(eq(workoutSets.sessionId, sessionId)),
    db.insert(workoutSets).values(data.sets.map((set) => ({ ...set, sessionId }))),
  ]);

  return true;
}

export async function deleteWorkoutSession(sessionId: string, userId: string) {
  const result = await db
    .delete(workoutSessions)
    .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
    .returning({ id: workoutSessions.id });

  return result.length > 0;
}
