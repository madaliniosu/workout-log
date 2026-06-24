import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.string().optional(),
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
