import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function updateUserName(userId: string, name: string) {
  await db.update(users).set({ name }).where(eq(users.id, userId));
}
