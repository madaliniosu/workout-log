import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { createWorkoutSession } from '@/db/queries/workouts';
import { workoutSessionSchema } from '@/lib/validations';


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = workoutSessionSchema.safeParse(await request.json());
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
