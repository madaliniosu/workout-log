import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Other'] as const;
export const DIMENSIONS = ['reps', 'time', 'weight', 'rpe', 'distance'] as const;

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.enum(MUSCLE_GROUPS).optional(),
  dimensions: z.array(z.enum(DIMENSIONS)).min(1),
});

export const setSchema = z.object({
  exerciseId: z.uuid(),
  reps: z.coerce.number().int().positive(),
  weight: z.coerce.number().nonnegative(),
  rpe: z.coerce.number().min(1).max(10).optional(),
});

export const workoutSessionSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().optional(),
  sets: z.array(setSchema).min(1),
});

export const updateNameSchema = z.object({
  name: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const workoutTemplateExerciseSchema = z.object({
  exerciseId: z.uuid(),
  setCount: z.coerce.number().int().positive(),
});

export const workoutTemplateSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
  exercises: z.array(workoutTemplateExerciseSchema).min(1),
});