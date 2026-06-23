import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { deleteWorkoutSession, updateWorkoutSession } from '@/db/queries/workouts';

const setSchema = z.object({
  exerciseId: z.uuid(),
  reps: z.coerce.number().int().positive(),
  weight: z.coerce.number().nonnegative(),
  rpe: z.coerce.number().min(1).max(10).optional(),
});

const updateSessionSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().optional(),
  sets: z.array(setSchema).min(1),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const parsed = updateSessionSchema.safeParse(await request.json());
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
