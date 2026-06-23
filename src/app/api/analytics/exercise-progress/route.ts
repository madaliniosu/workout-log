import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getExerciseProgress } from '@/db/queries/analytics';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exerciseId');
  if (!exerciseId) {
    return NextResponse.json({ error: 'Missing exerciseId' }, { status: 400 });
  }

  const progress = await getExerciseProgress(session.user.id, exerciseId);
  return NextResponse.json(progress);
}
