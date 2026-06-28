import { describe, expect, it } from 'vitest';
import {
  createExerciseSchema,
  signupSchema,
} from './validations';

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a short password', () => {
    const result = signupSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = signupSchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('createExerciseSchema', () => {
  it('requires a name', () => {
    const result = createExerciseSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('allows muscleGroup to be omitted', () => {
    const result = createExerciseSchema.safeParse({
      name: 'Squat',
      dimensions: ['reps'],
    });
    expect(result.success).toBe(true);
  });
});
