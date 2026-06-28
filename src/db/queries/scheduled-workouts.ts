import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  completedSets,
  exercises,
  scheduledWorkoutExercises,
  scheduledWorkoutExerciseTargets,
  scheduledWorkouts,
  workoutTemplateExercises,
  workoutTemplates,
} from '@/db/schema';

export async function createScheduledWorkout(
  userId: string,
  data: { templateId: string; scheduledAt: string },
) {
  const [template] = await db
    .select()
    .from(workoutTemplates)
    .where(
      and(
        eq(workoutTemplates.id, data.templateId),
        eq(workoutTemplates.userId, userId),
      ),
    );

  if (!template) {
    return null;
  }

  const templateExercises = await db
    .select({
      exerciseId: workoutTemplateExercises.exerciseId,
      exerciseName: exercises.name,
      setCount: workoutTemplateExercises.setCount,
      exerciseOrder: workoutTemplateExercises.exerciseOrder,
    })
    .from(workoutTemplateExercises)
    .innerJoin(exercises, eq(workoutTemplateExercises.exerciseId, exercises.id))
    .where(eq(workoutTemplateExercises.templateId, data.templateId))
    .orderBy(workoutTemplateExercises.exerciseOrder);

  const scheduledWorkoutId = crypto.randomUUID();

  await db.batch([
    db.insert(scheduledWorkouts).values({
      id: scheduledWorkoutId,
      userId,
      templateId: template.id,
      name: template.name,
      scheduledAt: data.scheduledAt,
    }),
    db.insert(scheduledWorkoutExercises).values(
      templateExercises.map((exercise) => ({
        scheduledWorkoutId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        setCount: exercise.setCount,
        exerciseOrder: exercise.exerciseOrder,
      })),
    ),
  ]);

  return scheduledWorkoutId;
}

export async function getScheduledWorkoutsForUser(userId: string) {
  return db
    .select({
      id: scheduledWorkouts.id,
      name: scheduledWorkouts.name,
      scheduledAt: scheduledWorkouts.scheduledAt,
      completed: scheduledWorkouts.completed,
    })
    .from(scheduledWorkouts)
    .where(eq(scheduledWorkouts.userId, userId));
}

export async function getScheduledWorkoutsWithExercisesForUser(userId: string) {
  const scheduled = await db
    .select({
      id: scheduledWorkouts.id,
      name: scheduledWorkouts.name,
      scheduledAt: scheduledWorkouts.scheduledAt,
      completed: scheduledWorkouts.completed,
    })
    .from(scheduledWorkouts)
    .where(
      and(
        eq(scheduledWorkouts.userId, userId),
        eq(scheduledWorkouts.completed, false),
      ),
    );

  if (scheduled.length === 0) {
    return [];
  }

  const exerciseRows = await db
    .select({
      id: scheduledWorkoutExercises.id,
      scheduledWorkoutId: scheduledWorkoutExercises.scheduledWorkoutId,
      exerciseId: scheduledWorkoutExercises.exerciseId,
      exerciseName: scheduledWorkoutExercises.exerciseName,
      setCount: scheduledWorkoutExercises.setCount,
      exerciseOrder: scheduledWorkoutExercises.exerciseOrder,
    })
    .from(scheduledWorkoutExercises)
    .where(
      inArray(
        scheduledWorkoutExercises.scheduledWorkoutId,
        scheduled.map((w) => w.id),
      ),
    )
    .orderBy(scheduledWorkoutExercises.exerciseOrder);

  const targetRows = exerciseRows.length
    ? await db
        .select()
        .from(scheduledWorkoutExerciseTargets)
        .where(
          inArray(
            scheduledWorkoutExerciseTargets.scheduledWorkoutExerciseId,
            exerciseRows.map((r) => r.id),
          ),
        )
    : [];

  const exercisesWithTargets = exerciseRows.map((row) => ({
    ...row,
    targets: targetRows.filter((t) => t.scheduledWorkoutExerciseId === row.id),
  }));

  return scheduled.map((workout) => ({
    ...workout,
    exercises: exercisesWithTargets.filter(
      (row) => row.scheduledWorkoutId === workout.id,
    ),
  }));
}

export async function completeScheduledWorkout(
  scheduledWorkoutId: string,
  userId: string,
  sets: { exerciseId: string | null; exerciseName: string; setNumber: number; dimension: string; value: number }[]
) {
  const [workout] = await db
    .select({ id: scheduledWorkouts.id })
    .from(scheduledWorkouts)
    .where(and(eq(scheduledWorkouts.id, scheduledWorkoutId), eq(scheduledWorkouts.userId, userId)));

  if (!workout) {
    return false;
  }

  await db.batch([
    db.insert(completedSets).values(
      sets.map((set) => ({
        scheduledWorkoutId,
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        setNumber: set.setNumber,
        dimension: set.dimension,
        value: set.value,
      }))
    ),
    db
      .update(scheduledWorkouts)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(scheduledWorkouts.id, scheduledWorkoutId)),
  ]);

  return true;
}


export async function deleteScheduledWorkout(
  scheduledWorkoutId: string,
  userId: string,
) {
  const result = await db
    .delete(scheduledWorkouts)
    .where(
      and(
        eq(scheduledWorkouts.id, scheduledWorkoutId),
        eq(scheduledWorkouts.userId, userId),
      ),
    )
    .returning({ id: scheduledWorkouts.id });

  return result.length > 0;
}
