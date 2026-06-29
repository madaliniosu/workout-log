import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, exerciseDimensions, hiddenExercises } from '@/db/schema';

export async function createExercise(
  userId: string,
  data: { name: string; muscleGroup?: string; category: string; dimensions: string[] }
) {
  const exerciseId = crypto.randomUUID();

  await db.batch([
    db.insert(exercises).values({
      id: exerciseId,
      name: data.name,
      muscleGroup: data.muscleGroup,
      category: data.category,
      userId,
    }),
    db.insert(exerciseDimensions).values(data.dimensions.map((dimension) => ({ exerciseId, dimension }))),
  ]);

  return { id: exerciseId, ...data, userId };
}

export async function deleteExercise(exerciseId: string, userId: string) {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId));

  if (!exercise) {
    return 'not_found' as const;
  }

  if (exercise.userId === null) {
    await db
      .insert(hiddenExercises)
      .values({ userId, exerciseId })
      .onConflictDoNothing();
    return 'hidden' as const;
  }

  if (exercise.userId !== userId) {
    return 'forbidden' as const;
  }

  await db.delete(exercises).where(eq(exercises.id, exerciseId));
  return 'deleted' as const;
}

export async function getExercisesForUser(userId: string) {
  const rows = await db
    .select({ exercise: exercises })
    .from(exercises)
    .leftJoin(
      hiddenExercises,
      and(
        eq(hiddenExercises.exerciseId, exercises.id),
        eq(hiddenExercises.userId, userId),
      ),
    )
    .where(
      and(
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
        isNull(hiddenExercises.userId),
      ),
    );

  const exerciseList = rows.map((row) => row.exercise);
  if (exerciseList.length === 0) {
    return [];
  }

  const dimensionRows = await db
    .select()
    .from(exerciseDimensions)
    .where(
      inArray(
        exerciseDimensions.exerciseId,
        exerciseList.map((e) => e.id),
      ),
    );

  return exerciseList.map((exercise) => ({
    ...exercise,
    dimensions: dimensionRows
      .filter((d) => d.exerciseId === exercise.id)
      .map((d) => d.dimension),
  }));
}
