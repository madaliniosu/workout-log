'use server';

import {auth, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';
import { changePasswordSchema, updateNameSchema } from '@/lib/validations';
import { getUserById, updateUserName, updateUserPassword } from '@/db/queries/users';
import bcrypt from 'bcryptjs';


// Logout
export async function logout() {
  await signOut({ redirectTo: '/login' });
}

// Change user name
export async function updateName(_previousState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return 'Not signed in';

  const parsed = updateNameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return 'Name is required';

  await updateUserName(session.user.id, parsed.data.name);
  revalidatePath('/settings');
  return undefined;
}

// Change password
export async function changePassword(
  _previousState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });
  if (!parsed.success) return { error: 'New password must be at least 8 characters' };

  const user = await getUserById(session.user.id);
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: 'Current password is incorrect' };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await updateUserPassword(session.user.id, passwordHash);
  return { success: true };
}