import { describe, expect, it } from 'vitest';
import { createExerciseSchema, signupSchema, workoutSessionSchema } from './validations';

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({ name: 'Test', email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects a short password', () => {
    const result = signupSchema.safeParse({ name: 'Test', email: 'test@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = signupSchema.safeParse({ name: 'Test', email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });
});

describe('createExerciseSchema', () => {
  it('requires a name', () => {
    const result = createExerciseSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('allows muscleGroup to be omitted', () => {
    const result = createExerciseSchema.safeParse({ name: 'Squat' });
    expect(result.success).toBe(true);
  });
});

describe('workoutSessionSchema', () => {
  const validSet = { exerciseId: '123e4567-e89b-12d3-a456-426614174000', reps: 10, weight: 50 };

  it('requires at least one set', () => {
    const result = workoutSessionSchema.safeParse({ date: new Date().toISOString(), sets: [] });
    expect(result.success).toBe(false);
  });

  it('rejects negative reps', () => {
    const result = workoutSessionSchema.safeParse({
      date: new Date().toISOString(),
      sets: [{ ...validSet, reps: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid session', () => {
    const result = workoutSessionSchema.safeParse({ date: new Date().toISOString(), sets: [validSet] });
    expect(result.success).toBe(true);
  });
});
