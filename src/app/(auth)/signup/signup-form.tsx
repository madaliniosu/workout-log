'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      setError(
        data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong',
      );
      setPending(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3 text-center lg:text-left">
        <h1 className="font-heading text-[32px] font-extrabold text-[#111111]">
          Create your account
        </h1>
        <p className="text-base text-[#666]">
          Start tracking your training today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="font-heading text-sm font-semibold text-[#111111]"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Alex"
              required
              className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-heading text-sm font-semibold text-[#111111]"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="alex@example.com"
              required
              className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-heading text-sm font-semibold text-[#111111]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-5">
          <button
            type="submit"
            disabled={pending}
            className="font-heading h-[60px] rounded-2xl bg-[#c8ff57] text-lg font-semibold text-[#111111] disabled:opacity-50"
          >
            {pending ? 'Signing up...' : 'Sign Up'}
          </button>

          <p className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#666]">Already have an account?</span>
            <Link
              href="/login"
              className="font-heading font-semibold text-[#111111]"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
