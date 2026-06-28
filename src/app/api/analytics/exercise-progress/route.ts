import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getExerciseProgress } from '@/db/queries/analytics';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const exerciseName = searchParams.get('exerciseName');
  if (!exerciseName) {
    return NextResponse.json({ error: 'Missing exerciseName' }, { status: 400 });
  }

  const progress = await getExerciseProgress(session.user.id, exerciseName);
  return NextResponse.json(progress);
}
