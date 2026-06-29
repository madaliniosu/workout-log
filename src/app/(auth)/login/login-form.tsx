'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from './actions';


export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="lg:text-left text-center font-heading text-[32px] font-extrabold text-[#111111]">Welcome back</h1>
        <p className="lg:text-left text-center text-base text-[#666]">Enter your credentials to access your dashboard.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-heading text-sm font-semibold text-[#111111]">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="font-heading text-sm font-semibold text-[#111111]">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-14 rounded-xl border border-[#e5e5e5] px-4 text-base text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#c8ff57]"
            />
            <div className='flex justify-end'>
              <span className="text-[13px] text-[#222]">Forgot password?</span>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-5">
          <button
            type="submit"
            disabled={pending}
            className="font-heading h-[60px] rounded-2xl bg-[#c8ff57] text-lg font-semibold text-[#111111] disabled:opacity-50"
          >
            {pending ? 'Logging in...' : 'Log In'}
          </button>

          <p className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#666]">Don&apos;t have an account?</span>
            <Link href="/signup" className="font-heading font-semibold text-[#111111]">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
