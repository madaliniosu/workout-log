import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createExercise, getExercisesForUser } from '@/db/queries/exercises';
import { createExerciseSchema } from '@/lib/validations';


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
