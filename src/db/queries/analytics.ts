import { eq, sql, and } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, workoutSessions, workoutSets } from '@/db/schema';

export async function getVolumeOverTime(userId: string) {
  return db
    .select({
      date: workoutSessions.date,
      volume: sql<number>`sum(${workoutSets.reps} * ${workoutSets.weight})`.as('volume'),
    })
    .from(workoutSessions)
    .innerJoin(workoutSets, eq(workoutSets.sessionId, workoutSessions.id))
    .where(eq(workoutSessions.userId, userId))
    .groupBy(workoutSessions.id, workoutSessions.date)
    .orderBy(workoutSessions.date);
}

export async function getPersonalRecords(userId: string) {
  return db
    .select({
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      maxWeight: sql<number>`max(${workoutSets.weight})`.as('maxWeight'),
    })
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(eq(workoutSessions.userId, userId))
    .groupBy(exercises.id, exercises.name)
    .orderBy(exercises.name);
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  return db
    .select({
      date: workoutSessions.date,
      maxWeight: sql<number>`max(${workoutSets.weight})`.as('maxWeight'),
    })
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSets.exerciseId, exerciseId)))
    .groupBy(workoutSessions.id, workoutSessions.date)
    .orderBy(workoutSessions.date);
}