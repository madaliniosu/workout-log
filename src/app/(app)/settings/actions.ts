'use server';

import {auth, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';
import { updateNameSchema } from '@/lib/validations';
import { updateUserName } from '@/db/queries/users';


//Logout
export async function logout() {
  await signOut({ redirectTo: '/login' });
}

//Change user name
export async function updateName(_previousState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return 'Not signed in';

  const parsed = updateNameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return 'Name is required';

  await updateUserName(session.user.id, parsed.data.name);
  revalidatePath('/settings');
  return undefined;
}