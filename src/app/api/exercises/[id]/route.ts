import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteExercise, updateExercise } from '@/db/queries/exercises';
import { createExerciseSchema } from '@/lib/validations';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = createExerciseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const result = await updateExercise(id, session.user.id, parsed.data);

  if (result === 'not_found') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (result === 'forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}


export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteExercise(id, session.user.id);

  if (result === 'not_found') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (result === 'forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true, result });
}
