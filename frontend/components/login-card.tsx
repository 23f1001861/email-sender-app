"use client";

import { signIn } from 'next-auth/react';

export function LoginCard() {
  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-3xl font-semibold text-center mb-8">Login</h1>
      <button
        className="w-full rounded-lg bg-emerald-100 text-emerald-800 py-3 font-medium hover:bg-emerald-200 transition"
        onClick={() => signIn('google')}
      >
        Login with Google
      </button>
      <div className="my-8 flex items-center gap-3 text-gray-400 text-sm">
        <span className="flex-1 border-t" />
        <span>or sign up through email</span>
        <span className="flex-1 border-t" />
      </div>
      <form className="space-y-4">
        <input
          disabled
          placeholder="Email ID"
          className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-400"
        />
        <input
          disabled
          placeholder="Password"
          className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-400"
        />
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-primary py-3 text-white font-semibold opacity-60"
        >
          Login
        </button>
      </form>
    </div>
  );
}
