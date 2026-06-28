import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { completeScheduledWorkout } from '@/db/queries/scheduled-workouts';
import { completeScheduledWorkoutSchema } from '@/lib/validations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = completeScheduledWorkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const success = await completeScheduledWorkout(id, session.user.id, parsed.data.sets);

  if (!success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
