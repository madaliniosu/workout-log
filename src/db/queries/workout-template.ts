import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, workoutTemplateExercises, workoutTemplates } from '@/db/schema';

export async function createWorkoutTemplate(
  userId: string,
  data: { name: string; notes?: string; exercises: { exerciseId: string; setCount: number }[] }
) {
  const templateId = crypto.randomUUID();

  await db.batch([
    db.insert(workoutTemplates).values({ id: templateId, userId, name: data.name, notes: data.notes }),
    db.insert(workoutTemplateExercises).values(
      data.exercises.map((exercise, index) => ({
        templateId,
        exerciseId: exercise.exerciseId,
        setCount: exercise.setCount,
        exerciseOrder: index,
      }))
    ),
  ]);

  return templateId;
}

export async function getWorkoutTemplatesForUser(userId: string) {
  const templates = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.userId, userId))
    .orderBy(desc(workoutTemplates.createdAt));

  if (templates.length === 0) {
    return [];
  }

  const templateExerciseRows = await db
    .select({
      templateId: workoutTemplateExercises.templateId,
      exerciseId: workoutTemplateExercises.exerciseId,
      exerciseName: exercises.name,
      setCount: workoutTemplateExercises.setCount,
      exerciseOrder: workoutTemplateExercises.exerciseOrder,
    })
    .from(workoutTemplateExercises)
    .innerJoin(exercises, eq(workoutTemplateExercises.exerciseId, exercises.id))
    .where(inArray(workoutTemplateExercises.templateId, templates.map((t) => t.id)))
    .orderBy(workoutTemplateExercises.exerciseOrder);

  return templates.map((template) => ({
    ...template,
    exercises: templateExerciseRows.filter((row) => row.templateId === template.id),
  }));
}

export async function deleteWorkoutTemplate(templateId: string, userId: string) {
  const result = await db
    .delete(workoutTemplates)
    .where(and(eq(workoutTemplates.id, templateId), eq(workoutTemplates.userId, userId)))
    .returning({ id: workoutTemplates.id });

  return result.length > 0;
}
