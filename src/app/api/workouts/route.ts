import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { createWorkoutSession } from '@/db/queries/workouts';

const setSchema = z.object({
  exerciseId: z.uuid(),
  reps: z.coerce.number().int().positive(),
  weight: z.coerce.number().nonnegative(),
  rpe: z.coerce.number().min(1).max(10).optional(),
});

const createSessionSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().optional(),
  sets: z.array(setSchema).min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = createSessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, notes, sets } = parsed.data;
  const sessionId = await createWorkoutSession(session.user.id, {
    date,
    notes,
    sets: sets.map((set, index) => ({ ...set, setOrder: index + 1 })),
  });

  return NextResponse.json({ id: sessionId }, { status: 201 });
}
