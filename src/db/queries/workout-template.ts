import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  exercises,
  workoutTemplateExercises,
  workoutTemplateExerciseTargets,
  workoutTemplates,
} from '@/db/schema';

export async function createWorkoutTemplate(
  userId: string,
  data: {
    name: string;
    notes?: string;
    exercises: {
      exerciseId: string;
      setCount: number;
      targets: { dimension: string; targetValue: number }[];
    }[];
  },
) {
  const templateId = crypto.randomUUID();

  const exerciseRows = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .where(
      inArray(
        exercises.id,
        data.exercises.map((e) => e.exerciseId),
      ),
    );
  const nameById = new Map(exerciseRows.map((e) => [e.id, e.name]));

  const templateExercises = data.exercises.map((exercise, index) => ({
    id: crypto.randomUUID(),
    exerciseId: exercise.exerciseId,
    exerciseName: nameById.get(exercise.exerciseId)!,
    setCount: exercise.setCount,
    exerciseOrder: index,
    targets: exercise.targets,
  }));

  await db.batch([
    db
      .insert(workoutTemplates)
      .values({ id: templateId, userId, name: data.name, notes: data.notes }),
    db.insert(workoutTemplateExercises).values(
      templateExercises.map(
        ({ id, exerciseId, exerciseName, setCount, exerciseOrder }) => ({
          id,
          templateId,
          exerciseId,
          exerciseName,
          setCount,
          exerciseOrder,
        }),
      ),
    ),
    db.insert(workoutTemplateExerciseTargets).values(
      templateExercises.flatMap((exercise) =>
        exercise.targets.map((target) => ({
          workoutTemplateExerciseId: exercise.id,
          dimension: target.dimension,
          targetValue: target.targetValue,
        })),
      ),
    ),
  ]);

  return templateId;
}

export async function getWorkoutTemplatesForUser(userId: string) {
  return db.query.workoutTemplates.findMany({
    where: eq(workoutTemplates.userId, userId),
    orderBy: desc(workoutTemplates.createdAt),
    with: {
      exercises: {
        orderBy: workoutTemplateExercises.exerciseOrder,
        with: { targets: true },
      },
    },
  });
}


export async function deleteWorkoutTemplate(
  templateId: string,
  userId: string,
) {
  const result = await db
    .delete(workoutTemplates)
    .where(
      and(
        eq(workoutTemplates.id, templateId),
        eq(workoutTemplates.userId, userId),
      ),
    )
    .returning({ id: workoutTemplates.id });

  return result.length > 0;
}
