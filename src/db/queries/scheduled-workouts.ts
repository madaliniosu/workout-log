import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  exercises,
  scheduledWorkoutExercises,
  scheduledWorkouts,
  workoutTemplateExercises,
  workoutTemplates,
} from '@/db/schema';

export async function createScheduledWorkout(userId: string, data: { templateId: string; scheduledAt: string }) {
  const [template] = await db
    .select()
    .from(workoutTemplates)
    .where(and(eq(workoutTemplates.id, data.templateId), eq(workoutTemplates.userId, userId)));

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
      }))
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

export async function deleteScheduledWorkout(scheduledWorkoutId: string, userId: string) {
  const result = await db
    .delete(scheduledWorkouts)
    .where(and(eq(scheduledWorkouts.id, scheduledWorkoutId), eq(scheduledWorkouts.userId, userId)))
    .returning({ id: scheduledWorkouts.id });

  return result.length > 0;
}
