import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteExercise } from '@/db/queries/exercises';

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
