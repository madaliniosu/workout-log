import { eq, isNull, or } from 'drizzle-orm';
import { db } from '@/db';
import { exercises } from '@/db/schema';

export async function getExercisesForUser(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, userId)));
}

export async function createExercise(userId: string, data: { name: string; muscleGroup?: string }) {
  const [exercise] = await db.insert(exercises).values({ ...data, userId }).returning();
  return exercise;
}
