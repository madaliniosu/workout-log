import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { createExercise, getExercisesForUser } from '@/db/queries/exercises';

const createExerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exercises = await getExercisesForUser(session.user.id);
  return NextResponse.json(exercises);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = createExerciseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exercise = await createExercise(session.user.id, parsed.data);
  return NextResponse.json(exercise, { status: 201 });
}
