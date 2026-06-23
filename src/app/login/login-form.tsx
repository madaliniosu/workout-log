'use client';

import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="max-w-sm mx-auto mt-20 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Log in</h1>
      <input name="email" type="email" placeholder="Email" required className="border rounded p-2" />
      <input name="password" type="password" placeholder="Password" required className="border rounded p-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
        {pending ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
