import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteWorkoutSession, updateWorkoutSession } from '@/db/queries/workouts';
import { workoutSessionSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const parsed = workoutSessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { date, notes, sets } = parsed.data;
  const updated = await updateWorkoutSession(id, session.user.id, {
    date,
    notes,
    sets: sets.map((set, index) => ({ ...set, setOrder: index + 1 })),
  });

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteWorkoutSession(id, session.user.id);

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
