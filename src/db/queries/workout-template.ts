import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { exercises, workoutTemplateExercises, workoutTemplateExerciseTargets, workoutTemplates } from '@/db/schema';

export async function createWorkoutTemplate(
  userId: string,
  data: {
    name: string;
    notes?: string;
    exercises: { exerciseId: string; setCount: number; targets: { dimension: string; targetValue: number }[] }[];
  }
) {
  const templateId = crypto.randomUUID();

  const templateExercises = data.exercises.map((exercise, index) => ({
    id: crypto.randomUUID(),
    exerciseId: exercise.exerciseId,
    setCount: exercise.setCount,
    exerciseOrder: index,
    targets: exercise.targets,
  }));

  await db.batch([
    db.insert(workoutTemplates).values({ id: templateId, userId, name: data.name, notes: data.notes }),
    db.insert(workoutTemplateExercises).values(
      templateExercises.map(({ id, exerciseId, setCount, exerciseOrder }) => ({
        id,
        templateId,
        exerciseId,
        setCount,
        exerciseOrder,
      }))
    ),
    db.insert(workoutTemplateExerciseTargets).values(
      templateExercises.flatMap((exercise) =>
        exercise.targets.map((target) => ({
          workoutTemplateExerciseId: exercise.id,
          dimension: target.dimension,
          targetValue: target.targetValue,
        }))
      )
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
      id: workoutTemplateExercises.id,
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

  const targetRows = templateExerciseRows.length
    ? await db
        .select()
        .from(workoutTemplateExerciseTargets)
        .where(inArray(workoutTemplateExerciseTargets.workoutTemplateExerciseId, templateExerciseRows.map((r) => r.id)))
    : [];

  const exercisesWithTargets = templateExerciseRows.map((row) => ({
    ...row,
    targets: targetRows.filter((t) => t.workoutTemplateExerciseId === row.id),
  }));

  return templates.map((template) => ({
    ...template,
    exercises: exercisesWithTargets.filter((row) => row.templateId === template.id),
  }));
}


export async function deleteWorkoutTemplate(templateId: string, userId: string) {
  const result = await db
    .delete(workoutTemplates)
    .where(and(eq(workoutTemplates.id, templateId), eq(workoutTemplates.userId, userId)))
    .returning({ id: workoutTemplates.id });

  return result.length > 0;
}
