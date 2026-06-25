import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createScheduledWorkout } from '@/db/queries/scheduled-workouts';
import { scheduleWorkoutSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = scheduleWorkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const scheduledWorkoutId = await createScheduledWorkout(session.user.id, parsed.data);

  if (!scheduledWorkoutId) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ id: scheduledWorkoutId }, { status: 201 });
}
