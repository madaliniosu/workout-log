import { and, eq, inArray, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  completedSets,
  exercises,
  scheduledWorkoutExercises,
  scheduledWorkoutExerciseTargets,
  scheduledWorkouts,
  workoutTemplateExercises,
  workoutTemplates,
  workoutTemplateExerciseTargets,
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
      id: workoutTemplateExercises.id,
      exerciseId: workoutTemplateExercises.exerciseId,
      exerciseName: exercises.name,
      setCount: workoutTemplateExercises.setCount,
      exerciseOrder: workoutTemplateExercises.exerciseOrder,
    })
    .from(workoutTemplateExercises)
    .innerJoin(exercises, eq(workoutTemplateExercises.exerciseId, exercises.id))
    .where(eq(workoutTemplateExercises.templateId, data.templateId))
    .orderBy(workoutTemplateExercises.exerciseOrder);

  const templateTargetRows = templateExercises.length
    ? await db
        .select()
        .from(workoutTemplateExerciseTargets)
        .where(
          inArray(
            workoutTemplateExerciseTargets.workoutTemplateExerciseId,
            templateExercises.map((e) => e.id),
          ),
        )
    : [];

  const scheduledWorkoutId = crypto.randomUUID();

  const scheduledExercises = templateExercises.map((exercise) => ({
    id: crypto.randomUUID(),
    templateExerciseId: exercise.id,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    setCount: exercise.setCount,
    exerciseOrder: exercise.exerciseOrder,
  }));

  await db.batch([
    db.insert(scheduledWorkouts).values({
      id: scheduledWorkoutId,
      userId,
      templateId: template.id,
      name: template.name,
      scheduledAt: data.scheduledAt,
    }),
    db.insert(scheduledWorkoutExercises).values(
      scheduledExercises.map(
        ({ id, exerciseId, exerciseName, setCount, exerciseOrder }) => ({
          id,
          scheduledWorkoutId,
          exerciseId,
          exerciseName,
          setCount,
          exerciseOrder,
        }),
      ),
    ),
    db.insert(scheduledWorkoutExerciseTargets).values(
      scheduledExercises.flatMap((exercise) =>
        templateTargetRows
          .filter(
            (target) =>
              target.workoutTemplateExerciseId === exercise.templateExerciseId,
          )
          .map((target) => ({
            scheduledWorkoutExerciseId: exercise.id,
            dimension: target.dimension,
            targetValue: target.targetValue,
          })),
      ),
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
  return db.query.scheduledWorkouts.findMany({
    where: and(
      eq(scheduledWorkouts.userId, userId),
      eq(scheduledWorkouts.completed, false),
    ),
    with: {
      exercises: {
        orderBy: scheduledWorkoutExercises.exerciseOrder,
        with: { targets: true },
      },
    },
  });
}

export async function completeScheduledWorkout(
  scheduledWorkoutId: string,
  userId: string,
  sets: {
    scheduledWorkoutExerciseId: string;
    setNumber: number;
    dimension: string;
    value: number;
  }[],
) {
  const [workout] = await db
    .select({ id: scheduledWorkouts.id })
    .from(scheduledWorkouts)
    .where(
      and(
        eq(scheduledWorkouts.id, scheduledWorkoutId),
        eq(scheduledWorkouts.userId, userId),
      ),
    );

  if (!workout) {
    return false;
  }

  const validExerciseRows = await db
    .select({ id: scheduledWorkoutExercises.id })
    .from(scheduledWorkoutExercises)
    .where(
      eq(scheduledWorkoutExercises.scheduledWorkoutId, scheduledWorkoutId),
    );
  const validExerciseIds = new Set(validExerciseRows.map((r) => r.id));

  if (
    sets.some((set) => !validExerciseIds.has(set.scheduledWorkoutExerciseId))
  ) {
    return false;
  }

  await db.batch([
    db.insert(completedSets).values(
      sets.map((set) => ({
        scheduledWorkoutExerciseId: set.scheduledWorkoutExerciseId,
        setNumber: set.setNumber,
        dimension: set.dimension,
        value: set.value,
      })),
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

export async function getWorkoutHistoryForUser(userId: string) {
  return db.query.scheduledWorkouts.findMany({
    where: and(
      eq(scheduledWorkouts.userId, userId),
      eq(scheduledWorkouts.completed, true),
    ),
    orderBy: desc(scheduledWorkouts.completedAt),
    with: {
      exercises: {
        orderBy: scheduledWorkoutExercises.exerciseOrder,
        with: {
          targets: true,
          completedSets: true,
        },
      },
    },
  });
}

export async function logAdHocWorkoutSession(
  userId: string,
  data: {
    name: string;
    date: string;
    exercises: {
      exerciseId: string | null;
      exerciseName: string;
      exerciseOrder: number;
      plannedTargets: { dimension: string; targetValue: number }[];
      sets: Record<string, number>[];
    }[];
  },
) {
  const today = new Date();
  const scheduledWorkoutId = crypto.randomUUID();

  const exerciseRows = data.exercises.map((exercise) => ({
    id: crypto.randomUUID(),
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    setCount: exercise.sets.length,
    exerciseOrder: exercise.exerciseOrder,
  }));

  const targetRows = data.exercises.flatMap((exercise, idx) =>
    exercise.plannedTargets.map((target) => ({
      scheduledWorkoutExerciseId: exerciseRows[idx].id,
      dimension: target.dimension,
      targetValue: target.targetValue,
    })),
  );

  const completedSetRows = data.exercises.flatMap((exercise, idx) =>
    exercise.sets.flatMap((setActuals, setIndex) =>
      Object.entries(setActuals).map(([dimension, value]) => ({
        scheduledWorkoutExerciseId: exerciseRows[idx].id,
        setNumber: setIndex + 1,
        dimension,
        value,
      })),
    ),
  );

  const batch: Parameters<typeof db.batch>[0] = [
    db.insert(scheduledWorkouts).values({
      id: scheduledWorkoutId,
      userId,
      templateId: null,
      name: data.name,
      scheduledAt: `${data.date}T00:00`,
      completed: true,
      completedAt: today,
    }),
    db.insert(scheduledWorkoutExercises).values(
      exerciseRows.map(
        ({ id, exerciseId, exerciseName, setCount, exerciseOrder }) => ({
          id,
          scheduledWorkoutId,
          exerciseId,
          exerciseName,
          setCount,
          exerciseOrder,
        }),
      ),
    ),
    ...(targetRows.length > 0
      ? [db.insert(scheduledWorkoutExerciseTargets).values(targetRows)]
      : []),
    ...(completedSetRows.length > 0
      ? [db.insert(completedSets).values(completedSetRows)]
      : []),
  ];

  await db.batch(batch);

  return scheduledWorkoutId;
}
