'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong');
      setPending(false);
      return;
    }

    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <input name="name" placeholder="Name" required className="border rounded p-2" />
      <input name="email" type="email" placeholder="Email" required className="border rounded p-2" />
      <input name="password" type="password" placeholder="Password" required className="border rounded p-2" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={pending} className="bg-black text-white rounded p-2 disabled:opacity-50">
        {pending ? 'Signing up...' : 'Sign up'}
      </button>
    </form>
  );
}
