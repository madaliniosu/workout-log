import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logAdHocWorkoutSession } from '@/db/queries/scheduled-workouts';
import { logWorkoutSessionSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = logWorkoutSessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await logAdHocWorkoutSession(session.user.id, parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
