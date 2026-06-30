import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Other',
] as const;

export const DIMENSIONS = ['reps', 'time', 'weight', 'distance'] as const;

export const LOGGABLE_DIMENSIONS = [...DIMENSIONS, 'rpe'] as const;

export const CATEGORIES = ['Strength', 'Cardio', 'Mobility', 'HIIT'] as const;



export const createExerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
  category: z.enum(CATEGORIES),
  dimensions: z.array(z.enum(DIMENSIONS)).min(1),
});

export const updateNameSchema = z.object({
  name: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const workoutTemplateExerciseTargetSchema = z.object({
  dimension: z.enum(DIMENSIONS),
  targetValue: z.coerce.number().nonnegative(),
});

export const workoutTemplateExerciseSchema = z.object({
  exerciseId: z.uuid(),
  setCount: z.coerce.number().int().positive(),
  targets: z.array(workoutTemplateExerciseTargetSchema).min(1),
});

export const workoutTemplateSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
  exercises: z.array(workoutTemplateExerciseSchema).min(1),
});

export const scheduleWorkoutSchema = z.object({
  templateId: z.uuid(),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
});

export const completedSetSchema = z
  .object({
    scheduledWorkoutExerciseId: z.uuid(),
    setNumber: z.coerce.number().int().positive(),
    dimension: z.enum(LOGGABLE_DIMENSIONS),
    value: z.coerce.number().nonnegative(),
  })
  .refine(
    (data) => data.dimension !== 'rpe' || (data.value >= 1 && data.value <= 10),
    {
      message: 'RPE must be between 1 and 10',
    },
  );

export const completeScheduledWorkoutSchema = z.object({
  sets: z.array(completedSetSchema).min(1),
});


export const logWorkoutSessionSchema = z.object({
  name: z.string().min(1),
  exercises: z
    .array(
      z.object({
        exerciseId: z.uuid().nullable(),
        exerciseName: z.string().min(1),
        exerciseOrder: z.coerce.number().int().nonnegative(),
        plannedTargets: z.array(
          z.object({
            dimension: z.enum(DIMENSIONS),
            targetValue: z.coerce.number().nonnegative(),
          })
        ),
        sets: z.array(z.record(z.string(), z.coerce.number())),
      })
    )
    .min(1),
});
