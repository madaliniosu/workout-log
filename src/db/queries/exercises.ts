import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, hiddenExercises, workoutSessions, workoutSets } from '@/db/schema';

export async function getExercisesForUser(userId: string) {
  const rows = await db
    .select({ exercise: exercises })
    .from(exercises)
    .leftJoin(
      hiddenExercises,
      and(eq(hiddenExercises.exerciseId, exercises.id), eq(hiddenExercises.userId, userId))
    )
    .where(
      and(
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
        isNull(hiddenExercises.userId)
      )
    );

  return rows.map((row) => row.exercise);
}


export async function deleteExercise(exerciseId: string, userId: string) {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, exerciseId));

  if (!exercise) {
    return 'not_found' as const;
  }

  if (exercise.userId === null) {
    await db.batch([
      db.insert(hiddenExercises).values({ userId, exerciseId }).onConflictDoNothing(),
      db.delete(workoutSets).where(
        and(
          eq(workoutSets.exerciseId, exerciseId),
          inArray(
            workoutSets.sessionId,
            db.select({ id: workoutSessions.id }).from(workoutSessions).where(eq(workoutSessions.userId, userId))
          )
        )
      ),
    ]);
    return 'hidden' as const;
  }

  if (exercise.userId !== userId) {
    return 'forbidden' as const;
  }

  await db.delete(exercises).where(eq(exercises.id, exerciseId));
  return 'deleted' as const;
}