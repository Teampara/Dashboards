"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="hide-in-print border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <a
          href="https://paraspect.in"
          target="_blank"
          rel="noreferrer"
          className="text-lg font-bold text-paraspect-navy"
        >
          Paraspect Storybook
        </a>
        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-paraspect-sky">
            Home
          </Link>
          <Link href="/create" className="text-sm font-medium text-slate-700 hover:text-paraspect-sky">
            Create
          </Link>
          {session?.user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="rounded-full bg-paraspect-teal px-4 py-2 text-xs font-semibold text-white"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
