'use client';

import { useActionState, useEffect, useRef } from 'react';
import { changePassword } from './actions';

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <h2 className="font-medium">Change password</h2>
      <input
        name="currentPassword"
        type="password"
        placeholder="Current password"
        required
        className="border rounded p-2"
      />
      <input
        name="newPassword"
        type="password"
        placeholder="New password"
        required
        className="border rounded p-2"
      />
      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.success && <p className="text-green-600 text-sm">Password updated.</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded p-2 disabled:opacity-50 self-start"
      >
        {pending ? 'Saving...' : 'Change password'}
      </button>
    </form>
  );
}
