import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { signupSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existing) {
    return NextResponse.json(
      { error: 'Email already in use' },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
