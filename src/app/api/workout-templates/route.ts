import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createWorkoutTemplate } from '@/db/queries/workout-template';
import { workoutTemplateSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = workoutTemplateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const templateId = await createWorkoutTemplate(session.user.id, parsed.data);
  return NextResponse.json({ id: templateId }, { status: 201 });
}
