import { eq, sql, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import {
  completedSets,
  scheduledWorkouts,
  scheduledWorkoutExercises,
  scheduledWorkoutExerciseTargets,
} from '@/db/schema';

export async function getVolumeOverTime(userId: string) {
  const repsSet = alias(completedSets, 'repsSet');
  const weightSet = alias(completedSets, 'weightSet');

  return db
    .select({
      date: scheduledWorkouts.completedAt,
      volume: sql<number>`sum(${repsSet.value} * ${weightSet.value})`.as(
        'volume',
      ),
    })
    .from(repsSet)
    .innerJoin(
      weightSet,
      and(
        eq(repsSet.scheduledWorkoutId, weightSet.scheduledWorkoutId),
        eq(repsSet.exerciseName, weightSet.exerciseName),
        eq(repsSet.setNumber, weightSet.setNumber),
      ),
    )
    .innerJoin(
      scheduledWorkouts,
      eq(repsSet.scheduledWorkoutId, scheduledWorkouts.id),
    )
    .where(
      and(
        eq(scheduledWorkouts.userId, userId),
        eq(repsSet.dimension, 'reps'),
        eq(weightSet.dimension, 'weight'),
      ),
    )
    .groupBy(scheduledWorkouts.id, scheduledWorkouts.completedAt)
    .orderBy(scheduledWorkouts.completedAt);
}

export async function getPersonalRecords(userId: string) {
  return db
    .select({
      exerciseName: completedSets.exerciseName,
      maxWeight: sql<number>`max(${completedSets.value})`.as('maxWeight'),
    })
    .from(completedSets)
    .innerJoin(
      scheduledWorkouts,
      eq(completedSets.scheduledWorkoutId, scheduledWorkouts.id),
    )
    .where(
      and(
        eq(scheduledWorkouts.userId, userId),
        eq(completedSets.dimension, 'weight'),
      ),
    )
    .groupBy(completedSets.exerciseName)
    .orderBy(completedSets.exerciseName);
}

export async function getExerciseNamesWithData(userId: string) {
  const rows = await db
    .select({ exerciseName: completedSets.exerciseName })
    .from(completedSets)
    .innerJoin(
      scheduledWorkouts,
      eq(completedSets.scheduledWorkoutId, scheduledWorkouts.id),
    )
    .where(eq(scheduledWorkouts.userId, userId))
    .groupBy(completedSets.exerciseName)
    .orderBy(completedSets.exerciseName);

  return rows.map((r) => r.exerciseName);
}

export async function getExerciseProgress(
  userId: string,
  exerciseName: string,
) {
  return db
    .select({
      date: scheduledWorkouts.completedAt,
      maxWeight: sql<number>`max(${completedSets.value})`.as('maxWeight'),
    })
    .from(completedSets)
    .innerJoin(
      scheduledWorkouts,
      eq(completedSets.scheduledWorkoutId, scheduledWorkouts.id),
    )
    .where(
      and(
        eq(scheduledWorkouts.userId, userId),
        eq(completedSets.exerciseName, exerciseName),
        eq(completedSets.dimension, 'weight'),
      ),
    )
    .groupBy(scheduledWorkouts.id, scheduledWorkouts.completedAt)
    .orderBy(scheduledWorkouts.completedAt);
}

export async function getPlannedVsActual(userId: string) {
  return db
    .select({
      exerciseName: scheduledWorkoutExercises.exerciseName,
      dimension: scheduledWorkoutExerciseTargets.dimension,
      avgPlanned:
        sql<number>`avg(${scheduledWorkoutExerciseTargets.targetValue})`.as(
          'avgPlanned',
        ),
      avgActual: sql<number>`avg(${completedSets.value})`.as('avgActual'),
    })
    .from(scheduledWorkoutExerciseTargets)
    .innerJoin(
      scheduledWorkoutExercises,
      eq(
        scheduledWorkoutExerciseTargets.scheduledWorkoutExerciseId,
        scheduledWorkoutExercises.id,
      ),
    )
    .innerJoin(
      scheduledWorkouts,
      eq(scheduledWorkoutExercises.scheduledWorkoutId, scheduledWorkouts.id),
    )
    .innerJoin(
      completedSets,
      and(
        eq(
          completedSets.scheduledWorkoutId,
          scheduledWorkoutExercises.scheduledWorkoutId,
        ),
        eq(completedSets.exerciseName, scheduledWorkoutExercises.exerciseName),
        eq(completedSets.dimension, scheduledWorkoutExerciseTargets.dimension),
      ),
    )
    .where(eq(scheduledWorkouts.userId, userId))
    .groupBy(
      scheduledWorkoutExercises.exerciseName,
      scheduledWorkoutExerciseTargets.dimension,
    )
    .orderBy(
      scheduledWorkoutExercises.exerciseName,
      scheduledWorkoutExerciseTargets.dimension,
    );
}
