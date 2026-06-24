'use client';

import { useActionState } from 'react';
import { updateName } from './actions';

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [error, formAction, pending] = useActionState(updateName, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium">
        Name
      </label>
      <input id="name" name="name" defaultValue={currentName} required className="border rounded p-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded p-2 disabled:opacity-50 self-start"
      >
        {pending ? 'Saving...' : 'Save name'}
      </button>
    </form>
  );
}
